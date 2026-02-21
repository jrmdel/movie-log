export enum EHistoryStatus {
  WATCHED = 'WATCHED',
  ABANDONED = 'ABANDONED',
  PLANNING = 'PLANNING',
}

export type HistoryStatus = keyof typeof EHistoryStatus;

export interface IHistory {
  accountId: string;
  movieId: string;
  watchedDates: Date[];
  rating?: number;
  notes?: string;
  status: HistoryStatus;
}

export interface IHistoryDocument extends IHistory {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
