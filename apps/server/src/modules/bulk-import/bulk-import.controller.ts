import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { IAuthenticatedRequest } from 'src/common/types/auth.types';
import { BulkImportService } from 'src/modules/bulk-import/bulk-import.service';
import { CreateBulkImportDto, ResolveBulkImportRowDto } from 'src/modules/bulk-import/bulk-import.dto';
import { IBulkImportJob } from 'src/modules/bulk-import/bulk-import.model';

@Controller({ version: '1', path: 'bulk-imports' })
@UseGuards(AuthGuard)
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Get()
  getActive(@Request() req: IAuthenticatedRequest): Promise<IBulkImportJob[]> {
    return this.bulkImportService.findActiveByAccountId(req.user._id);
  }

  @Get(':id')
  getById(@Request() req: IAuthenticatedRequest, @Param('id') id: string): Promise<IBulkImportJob> {
    return this.bulkImportService.getOwnedById(id, req.user._id);
  }

  @Post()
  create(@Request() req: IAuthenticatedRequest, @Body() dto: CreateBulkImportDto): Promise<IBulkImportJob> {
    return this.bulkImportService.create(req.user._id, dto);
  }

  @Patch(':id/rows/:rowId')
  resolveRow(
    @Request() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Param('rowId') rowId: string,
    @Body() dto: ResolveBulkImportRowDto,
  ): Promise<IBulkImportJob> {
    return this.bulkImportService.resolveRow(id, req.user._id, rowId, dto);
  }
}
