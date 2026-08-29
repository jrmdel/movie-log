import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model, PipelineStage, Types } from 'mongoose';
import { HistoryDocument } from 'src/modules/history/history.document';
import { IHistory, IHistoryDocument, IHistoryQuery, IHistoryWithMovie } from 'src/modules/history/history.model';

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

  // Joins each entry with its movie so clients can render history in a single round trip.
  findByAccountIdWithMovies(accountId: string, query: IHistoryQuery): Promise<IHistoryWithMovie[]> {
    const pipeline: PipelineStage[] = [
      ...this.buildAccountPipeline(accountId, query),
      {
        $lookup: {
          from: 'movies',
          let: { movieId: '$movieId' },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$movieId' }] } } }],
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
    ];
    return this.model.aggregate<IHistoryWithMovie>(pipeline).exec();
  }

  private buildAccountPipeline(accountId: string, query: IHistoryQuery): PipelineStage[] {
    const { movieId, limit, skip, sortOrder } = query;
    const filter: QueryFilter<IHistoryDocument> = { accountId, ...(movieId && { movieId }) };
    const order = sortOrder === 'ASC' ? 1 : -1;

    return [{ $match: filter }, { $sort: { viewedAt: order, createdAt: order } }, { $skip: skip }, { $limit: limit }];
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
