import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { IMovie } from 'src/modules/movie/movie.model';
import { BaseMovieProvider } from 'src/modules/movie/providers/base-movie.provider';
import { IImdbSuggestionResponse } from 'src/modules/movie/providers/imdb-suggestion.model';
import { convertToMovies } from 'src/modules/movie/providers/imdb-suggestion.tools';

@Injectable()
export class ImdbSuggestionProvider extends BaseMovieProvider {
  private readonly baseUrl = 'https://v3.sg.media-imdb.com/suggestion/titles/x';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async searchMovies(query: string, limit: number = 10): Promise<IMovie[]> {
    const url = `${this.baseUrl}/${encodeURIComponent(query)}.json`;
    const data = await this.request<IImdbSuggestionResponse>(url, undefined, 'search movies');

    return convertToMovies(data.d).slice(0, limit);
  }
}
