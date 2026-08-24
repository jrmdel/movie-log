import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMovieDetails } from 'src/modules/movie/movie.model';
import { BaseMovieProvider } from 'src/modules/movie/providers/base-movie.provider';
import { IOmdbDetailsParams, IOmdbMovieDetails } from 'src/modules/movie/providers/omdb.model';
import { convertToMovieDetails } from 'src/modules/movie/providers/omdb.tools';

@Injectable()
export class OmdbProvider extends BaseMovieProvider {
  private readonly baseUrl = 'https://www.omdbapi.com';
  private readonly apiKey: string;

  constructor(httpService: HttpService, configService: ConfigService) {
    super(httpService);
    this.apiKey = configService.get<string>('OMDB_API_KEY') ?? '';
  }

  async getMovieDetails(id: string): Promise<IMovieDetails> {
    const params: IOmdbDetailsParams = { apikey: this.apiKey, i: id, plot: 'full' };
    const data = await this.request<IOmdbMovieDetails>(this.baseUrl, params, 'fetch movie details');

    if (data.Response === 'False') {
      throw new NotFoundException(`Movie not found: ${data.Error}`);
    }
    return convertToMovieDetails(data);
  }
}
