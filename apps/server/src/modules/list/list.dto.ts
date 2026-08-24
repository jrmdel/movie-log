import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ICreateList, IUpdateList } from 'src/modules/list/list.model';

export class CreateListDto implements ICreateList {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateListDto implements IUpdateList {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddMovieToListDto {
  @IsString()
  @IsNotEmpty()
  movieId: string;
}
