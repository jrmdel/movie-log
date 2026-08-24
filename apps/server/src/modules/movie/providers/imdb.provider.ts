import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
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
      throw this.toHttpException(error, 'search movies');
    }
  }

  async getMovieDetails(id: string): Promise<IMovieDetails> {
    try {
      const url = `${this.baseUrl}/titles/${id}`;

      const request$ = this.httpService.get<ITitle>(url);
      const response = await firstValueFrom(request$);

      return convertToMovieDetails(response.data);
    } catch (error) {
      throw this.toHttpException(error, 'fetch movie details');
    }
  }

  private toHttpException(error: unknown, action: string): BadGatewayException | ServiceUnavailableException {
    // Distinguish "IMDb responded with an error" from "IMDb could not be reached at all".
    if (error instanceof AxiosError && error.response) {
      return new BadGatewayException(`Failed to ${action}: the movie provider returned an error`);
    }
    return new ServiceUnavailableException(`Failed to ${action}: the movie provider is unavailable`);
  }
}
