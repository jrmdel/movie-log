import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EListType, ICreateList, IListDocument, type ListType, IUpdateList } from 'src/modules/list/list.model';
import { ListRepository } from 'src/modules/list/list.repository';
import { MovieService } from 'src/modules/movie/movie.service';

const CUSTOM_LIST_TYPE: ListType = EListType.CUSTOM;
const WATCHLIST_LIST_TYPE: ListType = EListType.WATCHLIST;
const FAVORITES_LIST_TYPE: ListType = EListType.FAVORITES;

@Injectable()
export class ListService {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly movieService: MovieService,
  ) {}

  async getForAccount(accountId: string): Promise<IListDocument[]> {
    return this.listRepository.findByAccountId(accountId);
  }

  // Same 404 whether the list doesn't exist or belongs to someone else, to avoid leaking its existence.
  async getOwnedById(id: string, accountId: string): Promise<IListDocument> {
    const list = await this.listRepository.findById(id);
    if (!list || list.accountId !== accountId) {
      throw new NotFoundException('List not found');
    }
    return list;
  }

  async create(accountId: string, dto: ICreateList): Promise<IListDocument> {
    return this.listRepository.create({
      accountId,
      name: dto.name,
      description: dto.description,
      type: CUSTOM_LIST_TYPE,
      movieIds: [],
    });
  }

  async update(id: string, accountId: string, dto: IUpdateList): Promise<IListDocument> {
    const list = await this.getOwnedById(id, accountId);
    if (list.type !== CUSTOM_LIST_TYPE) {
      throw new ForbiddenException('This list cannot be renamed');
    }
    const updated = await this.listRepository.updateById(id, dto);
    return updated!;
  }

  async remove(id: string, accountId: string): Promise<void> {
    const list = await this.getOwnedById(id, accountId);
    if (list.type !== CUSTOM_LIST_TYPE) {
      throw new ForbiddenException('This list cannot be deleted');
    }
    await this.listRepository.deleteById(id);
  }

  async addMovie(id: string, accountId: string, movieId: string): Promise<IListDocument> {
    await this.getOwnedById(id, accountId);
    const movie = await this.movieService.resolveMovie(movieId);
    const updated = await this.listRepository.addMovie(id, movie._id);
    return updated!;
  }

  async removeMovie(id: string, accountId: string, movieId: string): Promise<IListDocument> {
    await this.getOwnedById(id, accountId);
    const updated = await this.listRepository.removeMovie(id, movieId);
    return updated!;
  }

  async deleteAllForAccount(accountId: string): Promise<void> {
    return this.listRepository.deleteAllForAccount(accountId);
  }

  // Called right after account registration so every account has exactly one of each from day one.
  async createSpecialLists(accountId: string): Promise<void> {
    await this.listRepository.create({ accountId, name: 'Watchlist', type: WATCHLIST_LIST_TYPE, movieIds: [] });
    await this.listRepository.create({ accountId, name: 'Favorites', type: FAVORITES_LIST_TYPE, movieIds: [] });
  }

  async getWatchlist(accountId: string): Promise<IListDocument> {
    return this.getSpecialList(accountId, WATCHLIST_LIST_TYPE);
  }

  async getFavorites(accountId: string): Promise<IListDocument> {
    return this.getSpecialList(accountId, FAVORITES_LIST_TYPE);
  }

  private async getSpecialList(accountId: string, type: ListType): Promise<IListDocument> {
    const list = await this.listRepository.findOneByAccountIdAndType(accountId, type);
    if (!list) {
      throw new NotFoundException('List not found');
    }
    return list;
  }
}
