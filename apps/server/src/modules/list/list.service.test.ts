import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IListDocument } from 'src/modules/list/list.model';
import { ListRepository } from 'src/modules/list/list.repository';
import { ListService } from 'src/modules/list/list.service';
import { MovieService } from 'src/modules/movie/movie.service';

describe('ListService', () => {
  let service: ListService;
  let listRepository: jest.Mocked<ListRepository>;
  let movieService: jest.Mocked<MovieService>;

  const customList: IListDocument = {
    _id: 'list-1',
    accountId: 'account-1',
    name: 'My List',
    type: 'CUSTOM',
    movieIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const watchlist: IListDocument = {
    ...customList,
    _id: 'list-2',
    name: 'Watchlist',
    type: 'WATCHLIST',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: ListRepository,
          useValue: {
            findByAccountId: jest.fn(),
            findById: jest.fn(),
            findOneByAccountIdAndType: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
            addMovie: jest.fn(),
            removeMovie: jest.fn(),
            deleteAllForAccount: jest.fn(),
          },
        },
        { provide: MovieService, useValue: { resolveMovie: jest.fn() } },
      ],
    }).compile();

    service = module.get(ListService);
    listRepository = module.get(ListRepository);
    movieService = module.get(MovieService);
  });

  describe('getOwnedById', () => {
    it('throws NotFoundException when the list belongs to a different account', async () => {
      listRepository.findById.mockResolvedValue(customList);

      await expect(service.getOwnedById('list-1', 'someone-else')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSpecialLists', () => {
    it('creates one Watchlist and one Favorites list for the account', async () => {
      listRepository.create.mockResolvedValue(watchlist);

      await service.createSpecialLists('account-1');

      expect(listRepository.create).toHaveBeenCalledWith({
        accountId: 'account-1',
        name: 'Watchlist',
        type: 'WATCHLIST',
        movieIds: [],
      });
      expect(listRepository.create).toHaveBeenCalledWith({
        accountId: 'account-1',
        name: 'Favorites',
        type: 'FAVORITES',
        movieIds: [],
      });
    });
  });

  describe('getWatchlist / getFavorites', () => {
    it('returns the account watchlist', async () => {
      listRepository.findOneByAccountIdAndType.mockResolvedValue(watchlist);

      const result = await service.getWatchlist('account-1');

      expect(listRepository.findOneByAccountIdAndType).toHaveBeenCalledWith('account-1', 'WATCHLIST');
      expect(result).toEqual(watchlist);
    });

    it('throws NotFoundException when the special list is missing', async () => {
      listRepository.findOneByAccountIdAndType.mockResolvedValue(null);

      await expect(service.getFavorites('account-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('forces the type to CUSTOM regardless of caller input', async () => {
      listRepository.create.mockResolvedValue(customList);

      await service.create('account-1', { name: 'My List' });

      expect(listRepository.create).toHaveBeenCalledWith({
        accountId: 'account-1',
        name: 'My List',
        description: undefined,
        type: 'CUSTOM',
        movieIds: [],
      });
    });
  });

  describe('update', () => {
    it('renames a custom list', async () => {
      listRepository.findById.mockResolvedValue(customList);
      listRepository.updateById.mockResolvedValue({ ...customList, name: 'Renamed' });

      const result = await service.update('list-1', 'account-1', { name: 'Renamed' });

      expect(result.name).toBe('Renamed');
    });

    it('rejects renaming a special list (Watchlist/Favorites)', async () => {
      listRepository.findById.mockResolvedValue(watchlist);

      await expect(service.update('list-2', 'account-1', { name: 'Renamed' })).rejects.toThrow(ForbiddenException);
      expect(listRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes a custom list', async () => {
      listRepository.findById.mockResolvedValue(customList);

      await service.remove('list-1', 'account-1');

      expect(listRepository.deleteById).toHaveBeenCalledWith('list-1');
    });

    it('rejects deleting a special list (Watchlist/Favorites)', async () => {
      listRepository.findById.mockResolvedValue(watchlist);

      await expect(service.remove('list-2', 'account-1')).rejects.toThrow(ForbiddenException);
      expect(listRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('addMovie', () => {
    it('resolves the movie before adding it to the list', async () => {
      listRepository.findById.mockResolvedValue(customList);
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
      listRepository.addMovie.mockResolvedValue({ ...customList, movieIds: ['movie-1'] });

      const result = await service.addMovie('list-1', 'account-1', 'tt123');

      expect(movieService.resolveMovie).toHaveBeenCalledWith('tt123');
      expect(listRepository.addMovie).toHaveBeenCalledWith('list-1', 'movie-1');
      expect(result.movieIds).toEqual(['movie-1']);
    });

    it('rejects adding movies to a list owned by someone else', async () => {
      listRepository.findById.mockResolvedValue(customList);

      await expect(service.addMovie('list-1', 'someone-else', 'tt123')).rejects.toThrow(NotFoundException);
      expect(movieService.resolveMovie).not.toHaveBeenCalled();
    });
  });
});
