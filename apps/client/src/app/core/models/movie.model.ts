export interface IMovie {
  externalId: string;
  title: string;
  year: number;
  rating?: number;
  url?: string;
}

export interface IMovieDocument {
  _id: string;
  externalId: string;
  title: string;
  year: number;
  directors: string[];
  genres: string[];
  stars: string[];
  rating: number;
  url?: string;
}
