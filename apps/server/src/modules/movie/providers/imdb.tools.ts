import { IMovie, IMovieDetails } from 'src/modules/movie/movie.model';
import { ISearchTitle, ITitle } from 'src/modules/movie/providers/imdb.model';

export function convertToMovieDetails(result: ITitle): IMovieDetails {
  return {
    externalId: result.id,
    title: result.primaryTitle,
    originalTitle: result.originalTitle,
    year: result.startYear,
    directors: result.directors.map((d) => d.displayName),
    genres: result.genres,
    stars: result.stars.map((s) => s.displayName),
    rating: result.rating.aggregateRating,
  };
}

export function convertToMovies(results: ISearchTitle[]): IMovie[] {
  if (!results?.length) {
    return [];
  }
  return results.filter(filterMovies).map((result) => convertToMovie(result));
}

function convertToMovie(result: ISearchTitle): IMovie {
  return {
    externalId: result.id,
    title: result.primaryTitle,
    originalTitle: result.originalTitle,
    year: result.startYear,
    rating: result.rating.aggregateRating,
  };
}

function filterMovies(result: ISearchTitle): boolean {
  return result.type === 'movie';
}
