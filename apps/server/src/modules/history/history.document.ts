import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IHistoryDocument } from 'src/modules/history/history.model';

@Schema({ timestamps: true, collection: 'histories', lean: true })
export class HistoryDocument extends Document<string> implements IHistoryDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'AccountDocument' })
  accountId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'MovieDocument' })
  movieId: string;

  @Prop({ type: Date })
  viewedAt?: Date;

  @Prop({ type: Number, min: 0, max: 5 })
  rating?: number;

  @Prop({ type: String })
  notes?: string;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryDocument);
HistorySchema.index({ accountId: 1, movieId: 1, viewedAt: 1 }, { unique: true });
