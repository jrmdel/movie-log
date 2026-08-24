import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieController } from 'src/modules/movie/movie.controller';
import { MovieDocument, MovieSchema } from 'src/modules/movie/movie.document';
import { MovieRepository } from 'src/modules/movie/movie.repository';
import { MovieService } from 'src/modules/movie/movie.service';
import { ImdbProvider } from 'src/modules/movie/providers/imdb.provider';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: MovieDocument.name, schema: MovieSchema }])],
  controllers: [MovieController],
  providers: [MovieRepository, MovieService, ImdbProvider],
  exports: [MovieService],
})
export class MovieModule {}
