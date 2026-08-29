export enum EListType {
  CUSTOM = 'CUSTOM',
  WATCHLIST = 'WATCHLIST',
  FAVORITES = 'FAVORITES',
}
export type ListType = keyof typeof EListType;

export interface IListDocument {
  _id: string;
  accountId: string;
  name: string;
  description?: string;
  type: ListType;
  movieIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateList {
  name: string;
  description?: string;
}

export interface IUpdateList {
  name?: string;
  description?: string;
}

export interface IAddMovieToList {
  movieId: string;
}
