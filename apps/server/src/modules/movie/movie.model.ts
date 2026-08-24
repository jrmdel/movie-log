export interface IMovie {
  externalId: string;
  title: string;
  year: number;
  // Only available once full movie details are fetched, OMDb's search endpoint doesn't return it.
  rating?: number;
  url?: string;
}

export interface ISearchMoviesQuery {
  query: string;
  limit?: number;
}

export interface IMovieDetails extends IMovie {
  directors: string[];
  genres: string[];
  stars: string[];
  rating: number;
}

export interface IMovieDocument extends IMovieDetails {
  _id: string;
  createdAt: Date;
}
