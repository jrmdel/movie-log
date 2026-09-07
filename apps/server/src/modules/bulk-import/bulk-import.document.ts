import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  type BulkImportJobStatus,
  type BulkImportRowStatus,
  type IBulkImportCandidate,
  type IBulkImportJob,
  type IBulkImportRow,
  type IBulkImportRowInput,
  EBulkImportJobStatus,
  EBulkImportRowStatus,
} from 'src/modules/bulk-import/bulk-import.model';

@Schema({ _id: false, timestamps: false, lean: true })
export class BulkImportRowInputSubdocument implements IBulkImportRowInput {
  @Prop({ type: String })
  imdbId?: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: Number })
  year?: number;

  @Prop({ type: String })
  viewDate?: string;
}
export const BulkImportRowInputSchema: MongooseSchema = SchemaFactory.createForClass(BulkImportRowInputSubdocument);

@Schema({ _id: false, timestamps: false, lean: true })
export class BulkImportCandidateSubdocument implements IBulkImportCandidate {
  @Prop({ required: true, type: String })
  externalId: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: Number })
  year?: number;

  @Prop({ type: String })
  url?: string;
}
export const BulkImportCandidateSchema: MongooseSchema = SchemaFactory.createForClass(BulkImportCandidateSubdocument);

@Schema({ _id: true, timestamps: false, lean: true })
export class BulkImportRowSubdocument extends Document<string> implements IBulkImportRow {
  @Prop({ required: true, type: BulkImportRowInputSchema })
  input: IBulkImportRowInput;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(EBulkImportRowStatus),
    default: EBulkImportRowStatus.PENDING,
  })
  status: BulkImportRowStatus;

  @Prop({ type: [BulkImportCandidateSchema] })
  candidates?: IBulkImportCandidate[];

  @Prop({ type: String, ref: 'MovieDocument' })
  movieId?: string;

  @Prop({ type: String, ref: 'HistoryDocument' })
  historyId?: string;

  @Prop({ type: String })
  error?: string;
}
export const BulkImportRowSchema: MongooseSchema = SchemaFactory.createForClass(BulkImportRowSubdocument);

@Schema({ timestamps: true, collection: 'bulkimportjobs', lean: true })
export class BulkImportJobDocument extends Document<string> implements IBulkImportJob {
  @Prop({ required: true, type: String, ref: 'AccountDocument' })
  accountId: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(EBulkImportJobStatus),
    default: EBulkImportJobStatus.PROCESSING,
  })
  status: BulkImportJobStatus;

  @Prop({ required: true, type: [BulkImportRowSchema], default: [] })
  rows: IBulkImportRow[];

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const BulkImportJobSchema: MongooseSchema = SchemaFactory.createForClass(BulkImportJobDocument);
