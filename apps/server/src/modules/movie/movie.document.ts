import { Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'movies',
  lean: true,
})
export class MovieDocument {}

export const MovieSchema = SchemaFactory.createForClass(MovieDocument);
