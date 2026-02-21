export interface IMovie {
  externalId: string;
  title: string;
  originalTitle: string;
  year: number;
  rating: number;
}

export interface IMovieDetails extends IMovie {
  directors: string[];
  genres: string[];
  stars: string[];
}

export interface IMovieDocument extends IMovieDetails {
  _id: string;
  createdAt: Date;
}
