import { Injectable, Logger } from '@nestjs/common';
import { Conversation } from './schemas/conversation.schema';
import { CustomerService } from './customer.service';
import { ConversationService } from './conversation.service';
import { ChannelType } from './enums/channel-type.enum';
import { ConversationStatus } from './enums/conversation-status.enum';
import { AgentService } from './agent.service';
import { MessageService } from './message.service';
import { MessageArray } from './utils/message-array';
import { Message } from './schemas/message.schema';
import { MessageType } from './enums/message-type.enum';
import { SenderType } from './enums/sender-type.enum';

@Injectable()
export class ConversationHelper {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly customerService: CustomerService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService
  ) { }

  async findOrCreateConversation(
    externalId: string,
    channel: ChannelType
  ): Promise<Conversation> {
    try {
      // Find or create customer
      const customer = await this.customerService.findOrCreateCustomer(externalId, channel);

      // Check if customer has a current active conversation
      if (customer.currentConversation) {
        const currentConversation = await this.conversationService.findOneConversationWithMessages(customer.currentConversation._id)

        if (currentConversation && currentConversation.status === ConversationStatus.OPEN) {
          return currentConversation;
        }
      }

      const agent = await this.agentService.findDefaultAgent();
      const newConversation = await this.conversationService.createConversation(customer, channel, agent);

      //TODO: Update customer new current conversation
      await this.customerService.updateCurrentConversation(customer._id, newConversation._id);

      return newConversation;
    } catch (error) {
      this.logger.error(`Error in findOrCreateConversation: ${error.message}`, error.stack);
      throw new Error(`Failed to find or create conversation: ${error.message}`);
    }
  }

  async getArrayMessage(conversation: Conversation): Promise<MessageArray> {
    const messageHistory = new MessageArray(this.messageService)
    if(conversation.messages || conversation.messages !== undefined) messageHistory.concat(conversation.messages);
    return messageHistory;
  }

  async generateNewMessage(conversation: Conversation, messageType: MessageType, content: any, senderType: SenderType,): Promise<Message> {
    const message = new Message();

    message.conversation = conversation;
    message.type = messageType;
    message.content = content;
    message.senderType = senderType;

    switch (senderType) {
      case SenderType.AGENT:
        message.sender = conversation.assignedAgent;
        break;
      case SenderType.CUSTOMER:
        message.sender = conversation.customer;
        break;
      case SenderType.EXTERNAL_SERVICE: //TODO : Ver esto que hacer cuando es una función.
        message.sender = conversation.customer
        break;
    }

    const respone = await this.messageService.create(message);;
    return respone; 
  }

  async deactivateAgentConversation(conversation_id : string){
    await this.conversationService.updateConversationStatus(conversation_id, ConversationStatus.AGENT_DESACTIVATED);
  }

  async closeConversation(conversation_id : string){
    await this.conversationService.closeConversation(conversation_id);
  }
}