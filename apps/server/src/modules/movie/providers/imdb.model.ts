interface IPrimaryImage {
  url: string;
  width: number;
  height: number;
}

interface IRating {
  aggregateRating: number;
  voteCount: number;
}

export interface ISearchTitle {
  id: string;
  type: 'movie' | 'tvSeries';
  primaryTitle: string;
  originalTitle: string;
  primaryImage: IPrimaryImage;
  startYear: number;
  endYear?: number;
  rating: IRating;
}

export interface ISearchTitleParams {
  query: string;
  limit?: number;
}

export interface ISearchTitleResponse {
  titles: ISearchTitle[];
}
