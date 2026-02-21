import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IMovieDocument } from 'src/modules/movie/movie.model';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'movies',
  lean: true,
})
export class MovieDocument extends Document<string> implements IMovieDocument {
  @Prop({ required: true, type: String })
  externalId: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  originalTitle: string;

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

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;
}

export const MovieSchema = SchemaFactory.createForClass(MovieDocument);
