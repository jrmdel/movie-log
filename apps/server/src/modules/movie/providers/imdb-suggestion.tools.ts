import { IMovie } from 'src/modules/movie/movie.model';
import { IImdbSuggestionResult } from 'src/modules/movie/providers/imdb-suggestion.model';

export function convertToMovies(results?: IImdbSuggestionResult[]): IMovie[] {
  if (!results?.length) {
    return [];
  }
  return results.filter(isMovie).map(convertToMovie);
}

function isMovie(result: IImdbSuggestionResult): boolean {
  return result.qid === 'movie';
}

function convertToMovie(result: IImdbSuggestionResult): IMovie {
  return {
    externalId: result.id,
    title: result.l,
    year: result.y ?? 0,
    url: result.i?.imageUrl,
  };
}
