export enum EListType {
  CUSTOM = 'CUSTOM',
  WATCHLIST = 'WATCHLIST',
  FAVORITES = 'FAVORITES',
}

export type ListType = keyof typeof EListType;

export interface IList {
  accountId: string;
  name: string;
  description?: string;
  type: ListType;
  movieIds: string[];
}

export interface IListDocument extends IList {
  _id: string;
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
