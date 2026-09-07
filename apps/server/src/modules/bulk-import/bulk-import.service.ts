import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseDatabaseService } from 'src/common/base/base-database.service';
import {
  type BulkImportJobStatus,
  type BulkImportRowStatus,
  EBulkImportJobStatus,
  EBulkImportRowStatus,
  IBulkImportCandidate,
  IBulkImportJob,
  IBulkImportRow,
  IBulkImportRowInput,
  ICreateBulkImport,
  IResolveBulkImportRow,
  IUpdateBulkImportRow,
} from 'src/modules/bulk-import/bulk-import.model';
import { BulkImportRepository } from 'src/modules/bulk-import/repositories/bulk-import.repository';
import { HistoryService } from 'src/modules/history/history.service';
import { IMovie } from 'src/modules/movie/movie.model';
import { MovieService } from 'src/modules/movie/movie.service';

const SEARCH_CANDIDATE_LIMIT = 10;
const MAX_STORED_CANDIDATES = 5;
// OMDb's free tier allows roughly 1 request/second; pace sequential row processing accordingly.
const OMDB_RATE_LIMIT_DELAY_MS = 1100;

const PENDING_ROW_STATUS: BulkImportRowStatus = EBulkImportRowStatus.PENDING;
const NEEDS_REVIEW_ROW_STATUS: BulkImportRowStatus = EBulkImportRowStatus.NEEDS_REVIEW;

@Injectable()
export class BulkImportService extends BaseDatabaseService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    private readonly bulkImportRepository: BulkImportRepository,
    private readonly movieService: MovieService,
    private readonly historyService: HistoryService,
  ) {
    super();
  }

  async create(accountId: string, dto: ICreateBulkImport): Promise<IBulkImportJob> {
    const job = await this.bulkImportRepository.create(accountId, dto.rows);
    // Fire-and-forget: the caller gets the job immediately and polls for progress.
    void this.processJob(accountId, job._id).catch((error: unknown) => {
      this.logger.error(`Bulk import job ${job._id} failed to process`, error instanceof Error ? error.stack : error);
    });
    return job;
  }

  findActiveByAccountId(accountId: string): Promise<IBulkImportJob[]> {
    return this.bulkImportRepository.findActiveByAccountId(accountId);
  }

  async getOwnedById(id: string, accountId: string): Promise<IBulkImportJob> {
    const job = await this.bulkImportRepository.findById(id);
    if (!job || job.accountId !== accountId) {
      throw new NotFoundException('Import job not found');
    }
    return job;
  }

  async resolveRow(
    jobId: string,
    accountId: string,
    rowId: string,
    dto: IResolveBulkImportRow,
  ): Promise<IBulkImportJob> {
    const job = await this.getOwnedById(jobId, accountId);
    const row = job.rows.find((r) => String(r._id) === rowId);
    if (!row) {
      throw new NotFoundException('Import row not found');
    }
    if (row.status !== NEEDS_REVIEW_ROW_STATUS) {
      throw new ConflictException('This row is not awaiting review');
    }

    const resolution = await this.resolveReviewedRow(accountId, row, dto);
    await this.bulkImportRepository.updateRowById(jobId, rowId, resolution);
    return this.recomputeJobStatus(jobId);
  }

  private resolveReviewedRow(
    accountId: string,
    row: IBulkImportRow,
    dto: IResolveBulkImportRow,
  ): Promise<IUpdateBulkImportRow> {
    if (dto.skip) {
      return Promise.resolve({ status: EBulkImportRowStatus.SKIPPED });
    }

    const candidate = row.candidates?.find((c) => c.externalId === dto.externalId);
    if (!candidate) {
      throw new ConflictException('Selected candidate is not a valid option for this row');
    }

    return this.importMovie(accountId, candidate.externalId, row.input.viewDate);
  }

  private async processJob(accountId: string, jobId: string): Promise<void> {
    const job = await this.bulkImportRepository.findById(jobId);
    if (!job) {
      return;
    }

    for (const row of job.rows) {
      let resolution: IUpdateBulkImportRow;
      try {
        resolution = await this.resolveRowInput(accountId, row.input);
      } catch (error) {
        this.logger.warn(`Failed to resolve bulk import row ${row._id}: ${String(error)}`);
        resolution = { status: EBulkImportRowStatus.FAILED, error: 'Unexpected error while resolving this movie' };
      }
      await this.bulkImportRepository.updateRowById(jobId, row._id, resolution);
      await this.delay(OMDB_RATE_LIMIT_DELAY_MS);
    }

    await this.recomputeJobStatus(jobId);
  }

  private async resolveRowInput(accountId: string, input: IBulkImportRowInput): Promise<IUpdateBulkImportRow> {
    if (input.imdbId) {
      return this.importMovie(accountId, input.imdbId, input.viewDate);
    }

    const matches = await this.movieService.searchMovies(input.title ?? '', SEARCH_CANDIDATE_LIMIT);
    const candidates = input.year ? matches.filter((movie) => movie.year === input.year) : matches;

    if (candidates.length === 0) {
      return { status: EBulkImportRowStatus.NOT_FOUND, error: 'No matching movie found' };
    }
    if (candidates.length === 1) {
      return this.importMovie(accountId, candidates[0].externalId, input.viewDate);
    }

    return {
      status: EBulkImportRowStatus.NEEDS_REVIEW,
      candidates: this.toCandidates(candidates.slice(0, MAX_STORED_CANDIDATES)),
    };
  }

  private async importMovie(accountId: string, externalId: string, viewDate?: string): Promise<IUpdateBulkImportRow> {
    try {
      const movie = await this.movieService.getOrCreateByExternalId(externalId);
      const historyEntry = await this.historyService.create(accountId, { movieId: movie._id, viewedAt: viewDate });
      return { status: EBulkImportRowStatus.IMPORTED, movieId: movie._id, historyId: historyEntry._id };
    } catch (error) {
      if (error instanceof ConflictException) {
        return { status: EBulkImportRowStatus.FAILED, error: 'You already logged this movie' };
      }
      if (error instanceof NotFoundException) {
        return { status: EBulkImportRowStatus.NOT_FOUND, error: 'Movie not found' };
      }
      throw error;
    }
  }

  private async recomputeJobStatus(jobId: string): Promise<IBulkImportJob> {
    const job = await this.bulkImportRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    const status: BulkImportJobStatus = job.rows.some((row) => row.status === PENDING_ROW_STATUS)
      ? EBulkImportJobStatus.PROCESSING
      : job.rows.some((row) => row.status === NEEDS_REVIEW_ROW_STATUS)
        ? EBulkImportJobStatus.NEEDS_REVIEW
        : EBulkImportJobStatus.COMPLETED;

    if (status === job.status) {
      return job;
    }

    const updated = await this.bulkImportRepository.updateStatus(jobId, status);
    return updated ?? job;
  }

  private toCandidates(movies: IMovie[]): IBulkImportCandidate[] {
    return movies.map((movie) => ({
      externalId: movie.externalId,
      title: movie.title,
      year: movie.year,
      url: movie.url,
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
