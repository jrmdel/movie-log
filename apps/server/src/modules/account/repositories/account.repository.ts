import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAccount, ICreateAccountDocument } from 'src/modules/account/account.model';
import { AccountDocument } from 'src/modules/account/schemas/account.document';

export class AccountRepository {
  constructor(
    @InjectModel(AccountDocument.name)
    private readonly model: Model<AccountDocument>,
  ) {}

  public async create(account: ICreateAccountDocument): Promise<IAccount> {
    const createdAccount = await this.model.create(account);
    return createdAccount.toObject();
  }

  public findById(id: string): Promise<IAccount | null> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.resolve(null);
    }
    return this.model.findById(id).lean().exec();
  }

  public findByEmail(email: string): Promise<IAccount | null> {
    return this.model.findOne({ email }).lean().exec();
  }

  public findBySubOrEmail(sub: string, email: string): Promise<IAccount | null> {
    return this.model
      .findOne({ $or: [{ _id: sub }, { email }] })
      .lean()
      .exec();
  }

  public async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }
}
