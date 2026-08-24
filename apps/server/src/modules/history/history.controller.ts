import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { IAuthenticatedRequest } from 'src/common/types/auth.types';
import { CreateHistoryDto, UpdateHistoryDto } from 'src/modules/history/history.dto';
import { IHistoryDocument } from 'src/modules/history/history.model';
import { HistoryService } from 'src/modules/history/history.service';

@Controller({ version: '1', path: 'history' })
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getAll(@Request() req: IAuthenticatedRequest): Promise<IHistoryDocument[]> {
    return this.historyService.getForAccount(req.user._id);
  }

  @Get(':id')
  getById(@Request() req: IAuthenticatedRequest, @Param('id') id: string): Promise<IHistoryDocument> {
    return this.historyService.getOwnedById(id, req.user._id);
  }

  @Post()
  create(@Request() req: IAuthenticatedRequest, @Body() dto: CreateHistoryDto): Promise<IHistoryDocument> {
    return this.historyService.create(req.user._id, dto);
  }

  @Patch(':id')
  update(
    @Request() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateHistoryDto,
  ): Promise<IHistoryDocument> {
    return this.historyService.update(id, req.user._id, dto);
  }

  @Delete(':id')
  remove(@Request() req: IAuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.historyService.remove(id, req.user._id);
  }
}
