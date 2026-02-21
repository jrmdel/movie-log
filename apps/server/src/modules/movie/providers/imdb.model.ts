interface IPrimaryImage {
  url: string;
  width: number;
  height: number;
}

interface IRating {
  aggregateRating: number;
  voteCount: number;
}

interface IMetacritic {
  score: number;
  reviewCount: number;
}

interface ICrewMember {
  id: string;
  displayName: string;
  alternativeNames?: string[];
  primaryImage?: IPrimaryImage;
  primaryProfessions: string[];
}

interface ICountry {
  code: string;
  name: string;
}

interface ILanguage {
  code: string;
  name: string;
}

interface IGenreInterest {
  id: string;
  name: string;
  isSubgenre?: boolean;
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

export interface ITitle {
  id: string;
  type: 'movie' | 'tvSeries';
  primaryTitle: string;
  originalTitle: string;
  primaryImage: IPrimaryImage;
  startYear: number;
  runtimeSeconds: number;
  genres: string[];
  rating: IRating;
  metacritic: IMetacritic;
  plot: string;
  directors: ICrewMember[];
  writers: ICrewMember[];
  stars: ICrewMember[];
  originCountries: ICountry[];
  spokenLanguages: ILanguage[];
  interests: IGenreInterest[];
}

export interface ISearchTitleParams {
  query: string;
  limit?: number;
}

export interface ISearchTitleResponse {
  titles: ISearchTitle[];
}
