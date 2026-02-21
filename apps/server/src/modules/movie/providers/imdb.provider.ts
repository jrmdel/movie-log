import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ISearchTitle, ISearchTitleParams, ISearchTitleResponse, ITitle } from 'src/modules/movie/providers/imdb.model';

@Injectable()
export class ImdbProvider {
  private readonly baseUrl = 'https://api.imdbapi.dev';

  constructor(private readonly httpService: HttpService) {}

  async searchTitles(query: string, limit: number = 10): Promise<ISearchTitle[]> {
    try {
      const url = `${this.baseUrl}/search/titles`;
      const params: ISearchTitleParams = { query, limit };

      const request$ = this.httpService.get<ISearchTitleResponse>(url, {
        params,
      });
      const response = await firstValueFrom(request$);

      return response.data.titles || [];
    } catch (error) {
      throw new Error(`Failed to search movies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMovieDetails(id: string): Promise<ITitle> {
    try {
      const url = `${this.baseUrl}/titles/${id}`;

      const request$ = this.httpService.get<ITitle>(url);
      const response = await firstValueFrom(request$);

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch movie details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
