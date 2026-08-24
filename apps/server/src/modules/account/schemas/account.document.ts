import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IAccount } from 'src/modules/account/account.model';

@Schema({ timestamps: true, collection: 'accounts', lean: true })
export class AccountDocument extends Document<string> implements IAccount {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: Date.now })
  lastLoginAt: Date;
}

export const AccountSchema: MongooseSchema = SchemaFactory.createForClass(AccountDocument);
