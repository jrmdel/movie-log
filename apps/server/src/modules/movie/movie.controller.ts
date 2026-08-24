import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { SearchMoviesQueryDto } from 'src/modules/movie/movie.dto';
import { IMovie, IMovieDocument } from 'src/modules/movie/movie.model';
import { MovieService } from 'src/modules/movie/movie.service';

@Controller({ version: '1', path: 'movies' })
@UseGuards(AuthGuard)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('search')
  search(@Query() query: SearchMoviesQueryDto): Promise<IMovie[]> {
    return this.movieService.searchMovies(query.query, query.limit);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<IMovieDocument> {
    return this.movieService.resolveMovie(id);
  }
}
