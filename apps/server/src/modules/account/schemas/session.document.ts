import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ISession } from 'src/modules/account/account.model';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'sessions',
  lean: true,
})
export class SessionDocument extends Document<string> implements ISession {
  declare _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  refreshTokenHash: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const SessionSchema: MongooseSchema = SchemaFactory.createForClass(SessionDocument);
