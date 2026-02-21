import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { IAuthenticatedRequest } from 'src/common/interfaces/authenticated-request';
import { HistoryService } from 'src/modules/history/history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getAll() {
    return this.historyService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.historyService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req: IAuthenticatedRequest, @Body() data: any) {
    const userId = req.user?._id;
    return this.historyService.create({ ...data, userId });
  }
}
