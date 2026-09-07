import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BulkImportJobDocument } from 'src/modules/bulk-import/bulk-import.document';
import {
  BulkImportJobStatus,
  EBulkImportRowStatus,
  IBulkImportJob,
  IBulkImportRowInput,
  IUpdateBulkImportRow,
} from 'src/modules/bulk-import/bulk-import.model';

export class BulkImportRepository {
  constructor(
    @InjectModel(BulkImportJobDocument.name)
    private readonly model: Model<BulkImportJobDocument>,
  ) {}

  async create(accountId: string, rows: IBulkImportRowInput[]): Promise<IBulkImportJob> {
    const created = await this.model.create({
      accountId,
      rows: rows.map((input) => ({ input, status: EBulkImportRowStatus.PENDING })),
    });
    return created.toObject();
  }

  findById(id: string): Promise<IBulkImportJob | null> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.resolve(null);
    }
    return this.model.findById(id).lean().exec();
  }

  findActiveByAccountId(accountId: string): Promise<IBulkImportJob[]> {
    return this.model
      .find({ accountId, status: { $ne: 'COMPLETED' } })
      .lean()
      .exec();
  }

  updateRowById(jobId: string, rowId: string, data: IUpdateBulkImportRow): Promise<IBulkImportJob | null> {
    return this.model
      .findOneAndUpdate(
        { _id: jobId, 'rows._id': rowId },
        {
          $set: {
            'rows.$.status': data.status,
            ...(data.candidates !== undefined && { 'rows.$.candidates': data.candidates }),
            ...(data.movieId !== undefined && { 'rows.$.movieId': data.movieId }),
            ...(data.historyId !== undefined && { 'rows.$.historyId': data.historyId }),
            ...(data.error !== undefined && { 'rows.$.error': data.error }),
          },
        },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();
  }

  updateStatus(jobId: string, status: BulkImportJobStatus): Promise<IBulkImportJob | null> {
    return this.model.findByIdAndUpdate(jobId, { status }, { returnDocument: 'after' }).lean().exec();
  }
}
