import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Adjust import path as needed
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessageType } from './enums/message-type.enum';
import { Conversation } from './schemas/conversation.schema';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>
  ) { }

  async addMessageToConversation(
    conversationId: Types.ObjectId,
    newMessage: CreateMessageDto
  ) {
    try {
      // Verify conversation exists
      const conversation = await this.conversationModel.findById(conversationId);
      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
      }

      // Create new message
      const message = new this.messageModel({
        conversation: conversationId,
        content: newMessage.content,
        type: newMessage.type || MessageType.TEXT,
        sender: newMessage.sender,
        senderType: newMessage.senderType,
        isRead: false
      });

      // Save the message
      await message.save();

    } catch (error) {
      this.logger.error(
        `Failed to add message to conversation ${conversationId}`,
        error.stack
      );
      throw new Error(`Could not add message: ${error.message}`);
    }
  }

  async create(message: Message): Promise<Message> {
    try {
      const newMessage = new this.messageModel(message);
      await newMessage.save();
      return newMessage;
    } catch (error) {
      await this.logger.error(MessageService.name, 'Failed to create message', null, message, error);
      throw error;
    }
  }
}