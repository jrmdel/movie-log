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

export interface ICreateHistory {
  movieId: string;
  viewedAt?: string;
  rating?: number;
}

export interface IUpdateHistory {
  viewedAt?: string;
  rating?: number;
}
