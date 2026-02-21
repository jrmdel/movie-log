import { Injectable } from '@nestjs/common';
import { ImdbProvider } from 'src/modules/movie/providers/imdb.provider';

@Injectable()
export class MovieService {
  constructor(private readonly imdbProvider: ImdbProvider) {}

  async searchMovies(query: string, limit?: number) {
    return this.imdbProvider.searchMovies(query, limit);
  }

  getMovieDetails(id: string) {
    return this.imdbProvider.getMovieDetails(id);
  }
}
