import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListDocument } from 'src/modules/list/list.document';
import { IList, IListDocument, ListType } from 'src/modules/list/list.model';

@Injectable()
export class ListRepository {
  constructor(
    @InjectModel(ListDocument.name)
    private readonly model: Model<ListDocument>,
  ) {}

  async create(data: IList): Promise<IListDocument> {
    const created = await this.model.create(data);
    return created.toObject();
  }

  findById(id: string): Promise<IListDocument | null> {
    return this.model.findById(id).lean().exec();
  }

  findByAccountId(accountId: string): Promise<IListDocument[]> {
    return this.model.find({ accountId }).lean().exec();
  }

  findOneByAccountIdAndType(accountId: string, type: ListType): Promise<IListDocument | null> {
    return this.model.findOne({ accountId, type }).lean().exec();
  }

  updateById(id: string, data: Partial<IList>): Promise<IListDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }

  addMovie(id: string, movieId: string): Promise<IListDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { $addToSet: { movieIds: movieId } }, { new: true })
      .lean()
      .exec();
  }

  removeMovie(id: string, movieId: string): Promise<IListDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { $pull: { movieIds: movieId } }, { new: true })
      .lean()
      .exec();
  }

  async deleteAllForAccount(accountId: string): Promise<void> {
    await this.model.deleteMany({ accountId }).exec();
  }
}
