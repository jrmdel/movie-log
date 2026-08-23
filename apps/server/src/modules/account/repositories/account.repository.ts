import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IAccount,
  ICreateAccountDocument,
} from 'src/modules/account/account.model';
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

  public async findById(id: string): Promise<IAccount | null> {
    return this.model.findById(id).lean().exec();
  }

  public async findByEmail(email: string): Promise<IAccount | null> {
    return this.model.findOne({ email }).lean().exec();
  }

  public async findBySubOrEmail(
    sub: string,
    email: string,
  ): Promise<IAccount | null> {
    return this.model
      .findOne({ $or: [{ _id: sub }, { email }] })
      .lean()
      .exec();
  }
}
