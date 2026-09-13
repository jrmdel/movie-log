import { InjectModel } from '@nestjs/mongoose';
import { IPaginatedResult } from 'src/common/common.model';
import { QueryFilter, Model, PipelineStage, Types } from 'mongoose';
import { HistoryDocument } from 'src/modules/history/history.document';
import {
  EHistorySortBy,
  IHistory,
  IHistoryDocument,
  IHistoryQuery,
  IHistoryWithMovie,
} from 'src/modules/history/history.model';

// Escapes regex metacharacters so user-provided search text is matched literally (no injection/ReDoS).
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class HistoryRepository {
  constructor(
    @InjectModel(HistoryDocument.name)
    private readonly model: Model<HistoryDocument>,
  ) {}

  async create(data: IHistory): Promise<IHistoryDocument> {
    const created = await this.model.create(data);
    return created.toObject();
  }

  findById(id: string): Promise<IHistoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.resolve(null);
    }
    return this.model.findById(id).lean().exec();
  }

  findByAccountId(accountId: string, query: IHistoryQuery): Promise<IHistoryDocument[]> {
    return this.model.aggregate<IHistoryDocument>(this.buildAccountPipeline(accountId, query)).exec();
  }

  // Joins each entry with its movie, filters/sorts on movie fields, and paginates via $facet for a total count.
  async findByAccountIdWithMovies(
    accountId: string,
    query: IHistoryQuery,
  ): Promise<IPaginatedResult<IHistoryWithMovie>> {
    const { movieId, limit, skip, sortOrder, search, sortBy } = query;
    const filter: QueryFilter<IHistoryDocument> = { accountId, ...(movieId && { movieId }) };
    const order = sortOrder === 'ASC' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'movies',
          let: { movieId: '$movieId' },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$movieId' }] } } }],
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      ...(search ? [{ $match: { 'movie.title': { $regex: escapeRegExp(search), $options: 'i' } } }] : []),
      {
        $facet: {
          items: [{ $sort: this.buildSortStage(sortBy, order) }, { $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const aggregate = this.model.aggregate<{ items: IHistoryWithMovie[]; totalCount: { count: number }[] }>(pipeline);
    if (sortBy === EHistorySortBy.TITLE) {
      aggregate.collation({ locale: 'en', strength: 2 });
    }
    const [result] = await aggregate.exec();

    return { items: result?.items ?? [], total: result?.totalCount[0]?.count ?? 0 };
  }

  private buildAccountPipeline(accountId: string, query: IHistoryQuery): PipelineStage[] {
    const { movieId, limit, skip, sortOrder } = query;
    const filter: QueryFilter<IHistoryDocument> = { accountId, ...(movieId && { movieId }) };
    const order = sortOrder === 'ASC' ? 1 : -1;

    return [{ $match: filter }, { $sort: { viewedAt: order, createdAt: order } }, { $skip: skip }, { $limit: limit }];
  }

  private buildSortStage(sortBy: IHistoryQuery['sortBy'], order: 1 | -1): Record<string, 1 | -1> {
    switch (sortBy) {
      case EHistorySortBy.RELEASE_YEAR:
        return { 'movie.year': order, viewedAt: order };
      case EHistorySortBy.TITLE:
        return { 'movie.title': order };
      case EHistorySortBy.VIEWED_AT:
      default:
        return { viewedAt: order, createdAt: order };
    }
  }

  findByMovieId(movieId: string): Promise<IHistoryDocument[]> {
    return this.model.find({ movieId }).lean().exec();
  }

  updateById(id: string, data: Partial<IHistory>): Promise<IHistoryDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }

  async deleteAllForAccount(accountId: string): Promise<void> {
    await this.model.deleteMany({ accountId }).exec();
  }
}
