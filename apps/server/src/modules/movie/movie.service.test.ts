import { Test, TestingModule } from '@nestjs/testing';
import { IMovieDetails, IMovieDocument } from 'src/modules/movie/movie.model';
import { MovieRepository } from 'src/modules/movie/movie.repository';
import { MovieService } from 'src/modules/movie/movie.service';
import { ImdbSuggestionProvider } from 'src/modules/movie/providers/imdb-suggestion.provider';
import { OmdbProvider } from 'src/modules/movie/providers/omdb.provider';

describe('MovieService', () => {
  let service: MovieService;
  let imdbSuggestionProvider: jest.Mocked<ImdbSuggestionProvider>;
  let omdbProvider: jest.Mocked<OmdbProvider>;
  let movieRepository: jest.Mocked<MovieRepository>;

  const movieDetails: IMovieDetails = {
    externalId: 'tt0816692',
    title: 'Interstellar',
    year: 2014,
    rating: 8.7,
    directors: ['Christopher Nolan'],
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    stars: ['Matthew McConaughey'],
  };

  const movieDocument: IMovieDocument = {
    ...movieDetails,
    _id: 'movie-id-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: ImdbSuggestionProvider,
          useValue: { searchMovies: jest.fn() },
        },
        {
          provide: OmdbProvider,
          useValue: { searchMovies: jest.fn(), getMovieDetails: jest.fn() },
        },
        {
          provide: MovieRepository,
          useValue: { findById: jest.fn(), findByExternalId: jest.fn(), create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(MovieService);
    imdbSuggestionProvider = module.get(ImdbSuggestionProvider);
    omdbProvider = module.get(OmdbProvider);
    movieRepository = module.get(MovieRepository);
  });

  describe('searchMovies', () => {
    it('delegates to the IMDb suggestion provider', async () => {
      const movies = [{ externalId: 'tt0816692', title: 'Interstellar', year: 2014 }];
      imdbSuggestionProvider.searchMovies.mockResolvedValue(movies);

      const result = await service.searchMovies('interstellar', 5);

      expect(imdbSuggestionProvider.searchMovies).toHaveBeenCalledWith('interstellar', 5);
      expect(result).toEqual(movies);
    });
  });

  describe('getOrCreateByExternalId', () => {
    it('returns the cached movie without calling the provider on a cache hit', async () => {
      movieRepository.findByExternalId.mockResolvedValue(movieDocument);

      const result = await service.getOrCreateByExternalId(movieDetails.externalId);

      expect(result).toEqual(movieDocument);
      expect(omdbProvider.getMovieDetails).not.toHaveBeenCalled();
      expect(movieRepository.create).not.toHaveBeenCalled();
    });

    it('fetches from the provider and persists it on a cache miss', async () => {
      movieRepository.findByExternalId.mockResolvedValue(null);
      omdbProvider.getMovieDetails.mockResolvedValue(movieDetails);
      movieRepository.create.mockResolvedValue(movieDocument);

      const result = await service.getOrCreateByExternalId(movieDetails.externalId);

      expect(omdbProvider.getMovieDetails).toHaveBeenCalledWith(movieDetails.externalId);
      expect(movieRepository.create).toHaveBeenCalledWith(movieDetails);
      expect(result).toEqual(movieDocument);
    });
  });

  describe('resolveMovie', () => {
    it('returns the movie by internal id when found', async () => {
      movieRepository.findById.mockResolvedValue(movieDocument);

      const result = await service.resolveMovie(movieDocument._id);

      expect(result).toEqual(movieDocument);
      expect(movieRepository.findByExternalId).not.toHaveBeenCalled();
    });

    it('falls back to get-or-create by external id when no internal match is found', async () => {
      movieRepository.findById.mockResolvedValue(null);
      movieRepository.findByExternalId.mockResolvedValue(null);
      omdbProvider.getMovieDetails.mockResolvedValue(movieDetails);
      movieRepository.create.mockResolvedValue(movieDocument);

      const result = await service.resolveMovie(movieDetails.externalId);

      expect(result).toEqual(movieDocument);
      expect(omdbProvider.getMovieDetails).toHaveBeenCalledWith(movieDetails.externalId);
    });
  });
});
