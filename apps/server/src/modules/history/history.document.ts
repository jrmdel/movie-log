import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IHistoryDocument } from 'src/modules/history/history.model';

@Schema({ timestamps: true, collection: 'histories', lean: true })
export class HistoryDocument extends Document<string> implements IHistoryDocument {
  @Prop({ required: true, type: String, ref: 'AccountDocument' })
  accountId: string;

  @Prop({ required: true, type: String, ref: 'MovieDocument' })
  movieId: string;

  @Prop({ type: Date })
  viewedAt?: Date;

  @Prop({ type: Number, min: 0, max: 5 })
  rating?: number;

  @Prop({ type: String })
  notes?: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const HistorySchema: MongooseSchema = SchemaFactory.createForClass(HistoryDocument);
HistorySchema.index({ accountId: 1, movieId: 1, viewedAt: 1 }, { unique: true });
