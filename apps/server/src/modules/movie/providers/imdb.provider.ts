import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ISearchTitle, ISearchTitleParams, ISearchTitleResponse } from 'src/modules/movie/providers/imdb.model';

export interface IMovieDetails {
  id: string;
  title: string;
  year?: number;
  description?: string;
  stars?: string[];
  genres?: string[];
  country?: string;
  runtime?: number;
  directors?: string[];
  imdbRating?: number;
}

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

  async getMovieDetails(id: string): Promise<IMovieDetails> {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/titles/${id}`));

      const data = response.data;

      return {
        id: data.id,
        title: data.title,
        year: data.year,
        description: data.description,
        stars: data.stars,
        genres: data.genres,
        country: data.country,
        runtime: data.runtime,
        directors: data.directors,
        imdbRating: data.imdbRating,
      };
    } catch (error) {
      throw new Error(`Failed to fetch movie details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
