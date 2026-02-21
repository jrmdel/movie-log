import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EHistoryStatus, type HistoryStatus, IHistoryDocument } from 'src/modules/history/history.model';

@Schema({ timestamps: true, collection: 'histories', lean: true })
export class HistoryDocument extends Document<string> implements IHistoryDocument {
  @Prop({ required: true, type: Types.ObjectId, unique: true, ref: 'AccountDocument' })
  accountId: string;

  @Prop({ required: true, type: Types.ObjectId, unique: true, ref: 'MovieDocument' })
  movieId: string;

  @Prop({ required: true, type: [Date] })
  watchedDates: Date[];

  @Prop({ type: Number, min: 0, max: 10 })
  rating?: number;

  @Prop({ type: String })
  notes?: string;

  @Prop({ required: true, type: String, enum: Object.values(EHistoryStatus) })
  status: HistoryStatus;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(HistoryDocument);
HistorySchema.index({ accountId: 1, movieId: 1 }, { unique: true });
