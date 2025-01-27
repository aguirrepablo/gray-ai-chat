import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Types } from 'mongoose';
import { Conversation } from './conversation.schema';
import { ChannelType } from '../enums/channel-type.enum';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  externalId: string; // Unique identifier from WhatsApp/Telegram

  @Prop({ required: true, enum: ChannelType })
  channel: ChannelType; // Added channel property
  
  @Prop()
  name?: string | null;

  @Prop()
  phone?: string | null;

  @Prop()
  email?: string | null;

  @Prop([{ type: Types.ObjectId, ref: 'Conversation' }])
  conversations: Conversation[];

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  currentConversation?: Conversation;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);