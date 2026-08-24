import { Injectable } from '@nestjs/common';
import { IMovie, IMovieDetails, IMovieDocument } from 'src/modules/movie/movie.model';
import { MovieRepository } from 'src/modules/movie/movie.repository';
import { ImdbProvider } from 'src/modules/movie/providers/imdb.provider';

@Injectable()
export class MovieService {
  constructor(
    private readonly imdbProvider: ImdbProvider,
    private readonly movieRepository: MovieRepository,
  ) {}

  async searchMovies(query: string, limit?: number): Promise<IMovie[]> {
    return this.imdbProvider.searchMovies(query, limit);
  }

  getMovieDetails(id: string): Promise<IMovieDetails> {
    return this.imdbProvider.getMovieDetails(id);
  }

  /** Looks up a cached movie by its IMDb id, fetching and persisting it from the provider on a cache miss. */
  async getOrCreateByExternalId(externalId: string): Promise<IMovieDocument> {
    const existing = await this.movieRepository.findByExternalId(externalId);
    if (existing) {
      return existing;
    }

    const details = await this.imdbProvider.getMovieDetails(externalId);
    return this.movieRepository.create(details);
  }

  /** Accepts either an internal movie id or an IMDb external id, transparently caching the latter. */
  async resolveMovie(id: string): Promise<IMovieDocument> {
    const byInternalId = await this.movieRepository.findById(id);
    if (byInternalId) {
      return byInternalId;
    }

    return this.getOrCreateByExternalId(id);
  }
}
