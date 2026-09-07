export enum EBulkImportRowStatus {
  PENDING = 'PENDING',
  IMPORTED = 'IMPORTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  NOT_FOUND = 'NOT_FOUND',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}
export type BulkImportRowStatus = keyof typeof EBulkImportRowStatus;

export enum EBulkImportJobStatus {
  PROCESSING = 'PROCESSING',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  COMPLETED = 'COMPLETED',
}
export type BulkImportJobStatus = keyof typeof EBulkImportJobStatus;

export interface IBulkImportRowInput {
  imdbId?: string;
  title?: string;
  year?: number;
  viewDate?: string;
}

export interface IBulkImportCandidate {
  externalId: string;
  title?: string;
  year?: number;
  url?: string;
}

export interface IBulkImportRow {
  _id: string;
  input: IBulkImportRowInput;
  status: BulkImportRowStatus;
  candidates?: IBulkImportCandidate[];
  movieId?: string;
  historyId?: string;
  error?: string;
}

export interface IBulkImportJob {
  _id: string;
  accountId: string;
  status: BulkImportJobStatus;
  rows: IBulkImportRow[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBulkImport {
  rows: IBulkImportRowInput[];
}

export interface IResolveBulkImportRow {
  externalId?: string;
  skip?: boolean;
}

export interface IUpdateBulkImportRow {
  status: BulkImportRowStatus;
  candidates?: IBulkImportCandidate[];
  movieId?: string;
  historyId?: string;
  error?: string;
}
