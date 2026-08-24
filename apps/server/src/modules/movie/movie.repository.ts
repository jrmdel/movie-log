import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMovieDetails, IMovieDocument } from 'src/modules/movie/movie.model';
import { MovieDocument } from 'src/modules/movie/movie.document';

@Injectable()
export class MovieRepository {
  constructor(
    @InjectModel(MovieDocument.name)
    private readonly model: Model<MovieDocument>,
  ) {}

  async create(movie: IMovieDetails): Promise<IMovieDocument> {
    const created = await this.model.create(movie);
    return created.toObject();
  }

  findById(id: string): Promise<IMovieDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.resolve(null);
    }
    return this.model.findById(id).lean().exec();
  }

  findByExternalId(externalId: string): Promise<IMovieDocument | null> {
    return this.model.findOne({ externalId }).lean().exec();
  }
}
