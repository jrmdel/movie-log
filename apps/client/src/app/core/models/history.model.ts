import { IMovieDocument } from '@src/app/core/models/movie.model';

export enum ESortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
export type SortOrder = keyof typeof ESortOrder;

export interface IHistoryDocument {
  _id: string;
  accountId: string;
  movieId: string;
  viewedAt?: Date;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHistoryWithMovie extends IHistoryDocument {
  movie: IMovieDocument;
}

export interface ICreateHistory {
  movieId: string;
  viewedAt?: string;
  rating?: number;
  notes?: string;
}

export interface IUpdateHistory {
  viewedAt?: string;
  rating?: number;
  notes?: string;
}

export interface IHistoryQuery {
  movieId?: string;
  limit?: number;
  skip?: number;
  sortOrder?: SortOrder;
}
