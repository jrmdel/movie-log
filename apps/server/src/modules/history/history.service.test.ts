import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IHistoryDocument } from 'src/modules/history/history.model';
import { HistoryRepository } from 'src/modules/history/repositories/history.repository';
import { HistoryService } from 'src/modules/history/history.service';
import { MovieService } from 'src/modules/movie/movie.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let historyRepository: jest.Mocked<HistoryRepository>;
  let movieService: jest.Mocked<MovieService>;

  const historyEntry: IHistoryDocument = {
    _id: 'history-1',
    accountId: 'account-1',
    movieId: 'movie-1',
    viewedAt: new Date('2024-01-01'),
    rating: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: HistoryRepository,
          useValue: {
            findByAccountId: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
            deleteAllForAccount: jest.fn(),
          },
        },
        { provide: MovieService, useValue: { resolveMovie: jest.fn() } },
      ],
    }).compile();

    service = module.get(HistoryService);
    historyRepository = module.get(HistoryRepository);
    movieService = module.get(MovieService);
  });

  describe('getOwnedById', () => {
    it('returns the entry when it belongs to the requesting account', async () => {
      historyRepository.findById.mockResolvedValue(historyEntry);

      const result = await service.getOwnedById('history-1', 'account-1');

      expect(result).toEqual(historyEntry);
    });

    it('throws NotFoundException when the entry does not exist', async () => {
      historyRepository.findById.mockResolvedValue(null);

      await expect(service.getOwnedById('missing', 'account-1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the entry belongs to a different account', async () => {
      historyRepository.findById.mockResolvedValue(historyEntry);

      await expect(service.getOwnedById('history-1', 'someone-else')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('resolves the movie and persists the history entry', async () => {
      movieService.resolveMovie.mockResolvedValue({
        _id: 'movie-1',
        externalId: 'tt123',
        title: 'A Movie',
        originalTitle: 'A Movie',
        year: 2020,
        rating: 7,
        directors: [],
        genres: [],
        stars: [],
        createdAt: new Date(),
      });
      historyRepository.create.mockResolvedValue(historyEntry);

      const result = await service.create('account-1', { movieId: 'tt123', viewedAt: '2024-01-01', rating: 4 });

      expect(movieService.resolveMovie).toHaveBeenCalledWith('tt123');
      expect(historyRepository.create).toHaveBeenCalledWith({
        accountId: 'account-1',
        movieId: 'movie-1',
        viewedAt: new Date('2024-01-01'),
        rating: 4,
      });
      expect(result).toEqual(historyEntry);
    });

    it('throws ConflictException when the account already logged this movie', async () => {
      movieService.resolveMovie.mockResolvedValue({
        _id: 'movie-1',
        externalId: 'tt123',
        title: 'A Movie',
        originalTitle: 'A Movie',
        year: 2020,
        rating: 7,
        directors: [],
        genres: [],
        stars: [],
        createdAt: new Date(),
      });
      historyRepository.create.mockRejectedValue({ code: 11000 });

      await expect(service.create('account-1', { movieId: 'tt123' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates only after verifying ownership', async () => {
      historyRepository.findById.mockResolvedValue(historyEntry);
      historyRepository.updateById.mockResolvedValue({ ...historyEntry, rating: 5 });

      const result = await service.update('history-1', 'account-1', { rating: 5 });

      expect(historyRepository.updateById).toHaveBeenCalledWith('history-1', { rating: 5 });
      expect(result.rating).toBe(5);
    });

    it('rejects updates for entries owned by another account', async () => {
      historyRepository.findById.mockResolvedValue(historyEntry);

      await expect(service.update('history-1', 'someone-else', { rating: 5 })).rejects.toThrow(NotFoundException);
      expect(historyRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes only after verifying ownership', async () => {
      historyRepository.findById.mockResolvedValue(historyEntry);

      await service.remove('history-1', 'account-1');

      expect(historyRepository.deleteById).toHaveBeenCalledWith('history-1');
    });

    it('rejects deletion for entries owned by another account', async () => {
      historyRepository.findById.mockResolvedValue(historyEntry);

      await expect(service.remove('history-1', 'someone-else')).rejects.toThrow(NotFoundException);
      expect(historyRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});
