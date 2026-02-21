import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryDocument } from 'src/modules/history/history.document';
import { IHistoryDocument } from 'src/modules/history/history.model';

export class HistoryRepository {
  constructor(
    @InjectModel(HistoryDocument.name)
    private readonly model: Model<HistoryDocument>,
  ) {}

  async create(data: IHistoryDocument): Promise<IHistoryDocument> {
    const created = await this.model.create(data);
    return created.toObject();
  }

  findById(id: string): Promise<IHistoryDocument | null> {
    return this.model.findById(id).lean().exec();
  }

  find(): Promise<IHistoryDocument[]> {
    return this.model.find().lean().exec();
  }

  findByAccountId(accountId: string): Promise<IHistoryDocument[]> {
    return this.model.find({ accountId }).lean().exec();
  }

  findByMovieId(movieId: string): Promise<IHistoryDocument[]> {
    return this.model.find({ movieId }).lean().exec();
  }
}
