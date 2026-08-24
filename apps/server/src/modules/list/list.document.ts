import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EListType, IListDocument, type ListType } from 'src/modules/list/list.model';

@Schema({ timestamps: true, collection: 'lists', lean: true })
export class ListDocument extends Document<string> implements IListDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'AccountDocument' })
  accountId: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, type: String, enum: Object.values(EListType) })
  type: ListType;

  @Prop({ required: true, type: [Types.ObjectId], ref: 'MovieDocument', default: [] })
  movieIds: string[];

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updatedAt: Date;
}

export const ListSchema = SchemaFactory.createForClass(ListDocument);

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
