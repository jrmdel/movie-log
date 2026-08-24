import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from 'src/modules/account/token.module';
import { MovieController } from 'src/modules/movie/movie.controller';
import { MovieDocument, MovieSchema } from 'src/modules/movie/movie.document';
import { MovieRepository } from 'src/modules/movie/movie.repository';
import { MovieService } from 'src/modules/movie/movie.service';
import { ImdbSuggestionProvider } from 'src/modules/movie/providers/imdb-suggestion.provider';
import { OmdbProvider } from 'src/modules/movie/providers/omdb.provider';

@Module({
  imports: [HttpModule, TokenModule, MongooseModule.forFeature([{ name: MovieDocument.name, schema: MovieSchema }])],
  controllers: [MovieController],
  providers: [MovieRepository, MovieService, ImdbSuggestionProvider, OmdbProvider],
  exports: [MovieService],
})
export class MovieModule {}
