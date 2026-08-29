import { IntersectionType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ESortOrder, IPagination, ISortOrder, type SortOrder } from 'src/common/common.model';

const DEFAULT_HISTORY_LIMIT = 20;
const MAX_HISTORY_LIMIT = 100;

export class PaginationDto implements IPagination {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HISTORY_LIMIT)
  limit: number = DEFAULT_HISTORY_LIMIT;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;
}

export class SortOrderDto implements ISortOrder {
  @IsOptional()
  @IsEnum(ESortOrder)
  sortOrder: SortOrder = ESortOrder.DESC;
}

export class PaginatedSortDto extends IntersectionType(PaginationDto, SortOrderDto) {}
