import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { IAuthenticatedRequest } from 'src/common/interfaces/authenticated-request';
import { AddMovieToListDto, CreateListDto, UpdateListDto } from 'src/modules/list/list.dto';
import { IListDocument } from 'src/modules/list/list.model';
import { ListService } from 'src/modules/list/list.service';

@Controller({ version: '1', path: 'lists' })
@UseGuards(AuthGuard)
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  create(@Request() req: IAuthenticatedRequest, @Body() dto: CreateListDto): Promise<IListDocument> {
    return this.listService.create(req.user!._id, dto);
  }

  @Get()
  getAll(@Request() req: IAuthenticatedRequest): Promise<IListDocument[]> {
    return this.listService.getForAccount(req.user!._id);
  }

  // Fixed paths must be declared before ':id' so they aren't shadowed by the param route.
  @Get('watchlist')
  getWatchlist(@Request() req: IAuthenticatedRequest): Promise<IListDocument> {
    return this.listService.getWatchlist(req.user!._id);
  }

  @Get('favorites')
  getFavorites(@Request() req: IAuthenticatedRequest): Promise<IListDocument> {
    return this.listService.getFavorites(req.user!._id);
  }

  @Get(':id')
  getById(@Request() req: IAuthenticatedRequest, @Param('id') id: string): Promise<IListDocument> {
    return this.listService.getOwnedById(id, req.user!._id);
  }

  @Patch(':id')
  update(
    @Request() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateListDto,
  ): Promise<IListDocument> {
    return this.listService.update(id, req.user!._id, dto);
  }

  @Delete(':id')
  remove(@Request() req: IAuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.listService.remove(id, req.user!._id);
  }

  @Post(':id/movies')
  addMovie(
    @Request() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddMovieToListDto,
  ): Promise<IListDocument> {
    return this.listService.addMovie(id, req.user!._id, dto.movieId);
  }

  @Delete(':id/movies/:movieId')
  removeMovie(
    @Request() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Param('movieId') movieId: string,
  ): Promise<IListDocument> {
    return this.listService.removeMovie(id, req.user!._id, movieId);
  }
}
