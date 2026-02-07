import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieController } from 'src/modules/movie/movie.controller';
import { MovieDocument, MovieSchema } from 'src/modules/movie/movie.document';
import { MovieRepository } from 'src/modules/movie/movie.repository';
import { MovieService } from 'src/modules/movie/movie.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MovieDocument.name, schema: MovieSchema },
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieRepository, MovieService],
})
export class MovieModule {}
