import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IMovie, IMovieDetails } from 'src/modules/movie/movie.model';
import { ISearchTitleParams, ISearchTitleResponse, ITitle } from 'src/modules/movie/providers/imdb.model';
import { convertToMovieDetails, convertToMovies } from 'src/modules/movie/providers/imdb.tools';

@Injectable()
export class ImdbProvider {
  private readonly baseUrl = 'https://api.imdbapi.dev';

  constructor(private readonly httpService: HttpService) {}

  async searchMovies(query: string, limit: number = 10): Promise<IMovie[]> {
    try {
      const url = `${this.baseUrl}/search/titles`;
      const params: ISearchTitleParams = { query, limit };

      const request$ = this.httpService.get<ISearchTitleResponse>(url, {
        params,
      });
      const response = await firstValueFrom(request$);

      return convertToMovies(response.data.titles);
    } catch (error) {
      throw new Error(`Failed to search movies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMovieDetails(id: string): Promise<IMovieDetails> {
    try {
      const url = `${this.baseUrl}/titles/${id}`;

      const request$ = this.httpService.get<ITitle>(url);
      const response = await firstValueFrom(request$);

      return convertToMovieDetails(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch movie details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
