import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { EListType, IListDocument, type ListType } from 'src/modules/list/list.model';

@Schema({ timestamps: true, collection: 'lists', lean: true })
export class ListDocument extends Document<string> implements IListDocument {
  @Prop({ required: true, type: String, ref: 'AccountDocument' })
  declare _id: string;

  accountId: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, type: String, enum: Object.values(EListType) })
  type: ListType;

  @Prop({ required: true, type: [String], ref: 'MovieDocument', default: [] })
  movieIds: string[];

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const ListSchema: MongooseSchema = SchemaFactory.createForClass(ListDocument);

// At most one Watchlist / Favorites list per account; custom lists are unrestricted.
// Explicit names avoid a duplicate-index collision, since both share the same {accountId, type} key pattern.
ListSchema.index(
  { accountId: 1, type: 1 },
  { name: 'unique_watchlist_per_account', unique: true, partialFilterExpression: { type: EListType.WATCHLIST } },
);
ListSchema.index(
  { accountId: 1, type: 1 },
  { name: 'unique_favorites_per_account', unique: true, partialFilterExpression: { type: EListType.FAVORITES } },
);
