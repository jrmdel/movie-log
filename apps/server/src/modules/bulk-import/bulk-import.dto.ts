import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  IBulkImportRowInput,
  ICreateBulkImport,
  IResolveBulkImportRow,
} from 'src/modules/bulk-import/bulk-import.model';

const MIN_YEAR = 1888; // Year of the earliest surviving motion picture.
const MAX_YEAR = 2100;
const MAX_ROWS_PER_IMPORT = 500;

export class CreateBulkImportRowDto implements IBulkImportRowInput {
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: IBulkImportRowInput) => !o.title)
  imdbId?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o: IBulkImportRowInput) => !o.imdbId)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(MIN_YEAR)
  @Max(MAX_YEAR)
  year?: number;

  @IsOptional()
  @IsDateString()
  viewDate?: string;
}

export class CreateBulkImportDto implements ICreateBulkImport {
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_ROWS_PER_IMPORT)
  @ValidateNested({ each: true })
  @Type(() => CreateBulkImportRowDto)
  rows: CreateBulkImportRowDto[];
}

export class ResolveBulkImportRowDto implements IResolveBulkImportRow {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  externalId?: string;

  @IsOptional()
  @IsBoolean()
  skip?: boolean;
}
