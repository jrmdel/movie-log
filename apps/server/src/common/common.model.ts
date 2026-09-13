export interface IPagination {
  limit: number;
  skip: number;
}

export interface ISortOrder {
  sortOrder: SortOrder;
}

export interface IPaginatedSort extends IPagination, ISortOrder {}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
}

export enum ESortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
export type SortOrder = keyof typeof ESortOrder;
