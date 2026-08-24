import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseDatabaseService } from 'src/common/base/base-database.service';
import { ICreateHistory, IHistoryDocument, IUpdateHistory } from 'src/modules/history/history.model';
import { HistoryRepository } from 'src/modules/history/repositories/history.repository';
import { MovieService } from 'src/modules/movie/movie.service';

@Injectable()
export class HistoryService extends BaseDatabaseService {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly movieService: MovieService,
  ) {
    super();
  }

  async getForAccount(accountId: string): Promise<IHistoryDocument[]> {
    return this.historyRepository.findByAccountId(accountId);
  }

  // Same 404 whether the entry doesn't exist or belongs to someone else, to avoid leaking its existence.
  async getOwnedById(id: string, accountId: string): Promise<IHistoryDocument> {
    const entry = await this.historyRepository.findById(id);
    if (!entry || entry.accountId !== accountId) {
      throw new NotFoundException('History entry not found');
    }
    return entry;
  }

  async create(accountId: string, dto: ICreateHistory): Promise<IHistoryDocument> {
    const movie = await this.movieService.resolveMovie(dto.movieId);

    try {
      return await this.historyRepository.create({
        accountId,
        movieId: movie._id,
        viewedAt: dto.viewedAt ? new Date(dto.viewedAt) : undefined,
        rating: dto.rating,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('You already logged this movie');
      }
      throw error;
    }
  }

  async update(id: string, accountId: string, dto: IUpdateHistory): Promise<IHistoryDocument> {
    await this.getOwnedById(id, accountId);
    const updated = await this.historyRepository.updateById(id, {
      ...(dto.viewedAt !== undefined && { viewedAt: new Date(dto.viewedAt) }),
      ...(dto.rating !== undefined && { rating: dto.rating }),
    });
    return updated!;
  }

  async remove(id: string, accountId: string): Promise<void> {
    await this.getOwnedById(id, accountId);
    await this.historyRepository.deleteById(id);
  }

  async deleteAllForAccount(accountId: string): Promise<void> {
    return this.historyRepository.deleteAllForAccount(accountId);
  }
}
