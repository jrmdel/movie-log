import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HistoryDocument } from 'src/modules/history/history.document';
import { IHistory, IHistoryDocument } from 'src/modules/history/history.model';

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

  findByAccountId(accountId: string): Promise<IHistoryDocument[]> {
    return this.model.find({ accountId }).lean().exec();
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
