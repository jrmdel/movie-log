import { IPaginatedSort } from 'src/common/common.model';
import { IMovieDocument } from 'src/modules/movie/movie.model';

export interface IHistory {
  accountId: string;
  movieId: string;
  viewedAt?: Date;
  rating?: number;
  notes?: string;
}

export interface IHistoryDocument extends IHistory {
  _id: string;
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

export interface IHistoryQuery extends IPaginatedSort {
  movieId?: string;
  search?: string;
  sortBy?: HistorySortBy;
}

export enum EHistorySortBy {
  VIEWED_AT = 'VIEWED_AT',
  RELEASE_YEAR = 'RELEASE_YEAR',
  TITLE = 'TITLE',
}
export type HistorySortBy = keyof typeof EHistorySortBy;
