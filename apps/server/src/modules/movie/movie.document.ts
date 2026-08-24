import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IMovieDocument } from 'src/modules/movie/movie.model';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'movies',
  lean: true,
})
export class MovieDocument extends Document<string> implements IMovieDocument {
  @Prop({ required: true, type: String, unique: true })
  externalId: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  year: number;

  @Prop({ required: true, type: [String] })
  directors: string[];

  @Prop({ required: true, type: [String] })
  genres: string[];

  @Prop({ required: true, type: [String] })
  stars: string[];

  @Prop({ required: true, type: Number })
  rating: number;

  declare createdAt: Date;
}

export const MovieSchema: MongooseSchema = SchemaFactory.createForClass(MovieDocument);
