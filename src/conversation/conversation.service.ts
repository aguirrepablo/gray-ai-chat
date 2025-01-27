import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { ConversationStatus } from './enums/conversation-status.enum';
import { Customer } from './schemas/customer.schema';
import { ChannelType } from './enums/channel-type.enum';
import { Agent } from './schemas/agent.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>
  ) {}

  async createConversation(
    customer: Customer, 
    channel: ChannelType,
    agent: Agent
  ): Promise<Conversation> {
    try {
      
      // Create a new conversation
      const newConversation = new this.conversationModel({
        customer: customer,
        channel: channel,
        assignedAgent : agent
      });

      // Save the new conversation
      await newConversation.save();

      // Populate and return the new conversation
      return await this.conversationModel
        .findById(newConversation._id)
        .populate('customer')
        .populate('assignedAgent');
    } catch (error) {
      // Handle any errors during conversation creation
      throw new Error(`Failed to get or create conversation: ${error.message}`);
    }
  }

  async findOneConversation(conversationId: Types.ObjectId): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(conversationId).populate('customer').populate('assignedAgent');

    return conversation;
  }

  async findOneConversationWithMessages(conversationId: Types.ObjectId): Promise<Conversation> {
    return (await this.conversationModel.findById(conversationId).populate('customer').populate('assignedAgent').populate({
      path: 'messages',
      options: {
        sort: { createdAt: -1 }, // Ordenar por fecha de creación (descendente)
      },
    }));
  }

  async closeConversation(conversationId: Types.ObjectId): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Close the conversation
    conversation.status = ConversationStatus.CLOSED;
    conversation.closedAt = new Date();

    return conversation.save();
  }
}