import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Types } from 'mongoose';
import { Message } from './message.schema';
import { ChannelType } from '../enums/channel-type.enum';
import { ConversationStatus } from '../enums/conversation-status.enum';
import { Customer } from './customer.schema';
import { Agent } from './agent.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  _id: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer: Customer;

  @Prop({ type: Types.ObjectId, ref: 'Agent' })
  assignedAgent?: Agent;

  @Prop({ enum: ChannelType, required: true })
  channel: ChannelType;

  @Prop({ enum: ConversationStatus, default: ConversationStatus.OPEN })
  status: ConversationStatus;

  @Prop({ type: Date })
  closedAt?: Date;

  messages?: Message[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'conversation',
});

ConversationSchema.set('toObject', { virtuals: true });
ConversationSchema.set('toJSON', { virtuals: true });