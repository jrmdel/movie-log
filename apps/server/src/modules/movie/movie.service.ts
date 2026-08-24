import { ConflictException, Injectable } from '@nestjs/common';
import { BaseDatabaseService } from 'src/common/base/base-database.service';
import { IMovie, IMovieDetails, IMovieDocument } from 'src/modules/movie/movie.model';
import { MovieRepository } from 'src/modules/movie/movie.repository';
import { ImdbSuggestionProvider } from 'src/modules/movie/providers/imdb-suggestion.provider';
import { OmdbProvider } from 'src/modules/movie/providers/omdb.provider';

@Injectable()
export class MovieService extends BaseDatabaseService {
  constructor(
    private readonly imdbSuggestionProvider: ImdbSuggestionProvider,
    private readonly omdbProvider: OmdbProvider,
    private readonly movieRepository: MovieRepository,
  ) {
    super();
  }

  async searchMovies(query: string, limit?: number): Promise<IMovie[]> {
    return this.imdbSuggestionProvider.searchMovies(query, limit);
  }

  getMovieDetails(id: string): Promise<IMovieDetails> {
    return this.omdbProvider.getMovieDetails(id);
  }

  /** Looks up a cached movie by its IMDb id, fetching and persisting it from the provider on a cache miss. */
  async getOrCreateByExternalId(externalId: string): Promise<IMovieDocument> {
    const existing = await this.movieRepository.findByExternalId(externalId);
    if (existing) {
      return existing;
    }

    try {
      const details = await this.omdbProvider.getMovieDetails(externalId);
      return this.movieRepository.create(details);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Movie with this external ID already exists');
      }
      throw error;
    }
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
