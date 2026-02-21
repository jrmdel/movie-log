import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
  create(@Body() data: any) {
    return this.historyService.create(data);
  }
}
