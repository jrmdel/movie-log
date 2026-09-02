import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginatedSortDto } from 'src/common/common.dto';
import { ICreateHistory, IHistoryQuery, IUpdateHistory } from 'src/modules/history/history.model';

const MIN_RATING = 0;
const MAX_RATING = 5;

export class CreateHistoryDto implements ICreateHistory {
  @IsString()
  @IsNotEmpty()
  movieId: string;

  @IsOptional()
  @IsDateString()
  viewedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  rating?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateHistoryDto implements IUpdateHistory {
  @IsOptional()
  @IsDateString()
  viewedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  rating?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetHistoryQueryDto extends PaginatedSortDto implements IHistoryQuery {
  @IsOptional()
  @IsString()
  movieId?: string;
}
