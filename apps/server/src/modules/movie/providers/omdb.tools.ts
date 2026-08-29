import { IMovieDetails } from 'src/modules/movie/movie.model';
import { IOmdbMovieDetails } from 'src/modules/movie/providers/omdb.model';

const NOT_AVAILABLE = 'N/A';

export function convertToMovieDetails(result: IOmdbMovieDetails): IMovieDetails {
  return {
    externalId: result.imdbID,
    title: result.Title,
    year: parseYear(result.Year),
    directors: parseList(result.Director),
    genres: parseList(result.Genre),
    stars: parseList(result.Actors),
    rating: parseRating(result.imdbRating),
    url: result.Poster,
  };
}

function parseYear(year: string): number {
  return parseInt(year, 10);
}

function parseRating(rating: string): number {
  const parsed = parseFloat(rating);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseList(value: string): string[] {
  if (!value || value === NOT_AVAILABLE) {
    return [];
  }
  return value.split(', ');
}
