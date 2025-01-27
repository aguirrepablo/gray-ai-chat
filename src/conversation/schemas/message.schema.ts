import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from './customer.schema';
import { Agent } from './agent.schema';
import { MessageType } from '../enums/message-type.enum';
import { Conversation } from './conversation.schema';
import { SenderType } from '../enums/sender-type.enum';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
    conversation: Conversation;
  
    @Prop({ enum: MessageType, default: MessageType.TEXT })
    type: MessageType;
  
    @Prop({ required: true })
    content: any[];
  
    @Prop({ type: Types.ObjectId, refPath: 'sender' })
    sender: Customer | Agent;
  
    @Prop({ required: true })
    senderType: SenderType;
  
    @Prop({ default: false })
    isRead: boolean;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updateddAt: Date;
  }

export const MessageSchema = SchemaFactory.createForClass(Message);