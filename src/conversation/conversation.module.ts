import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AgentService } from './agent.service';
import { CustomerService } from './customer.service';
import { ConversationHelper } from './conversation.helper';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Agent, AgentSchema } from './schemas/agent.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { MessageService } from './message.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema },{ name: Conversation.name, schema: ConversationSchema }, { name: Customer.name, schema: CustomerSchema }, { name: Message.name, schema: MessageSchema }])],
  providers: [ConversationService, AgentService, CustomerService, ConversationHelper, MessageService],
  exports: [ConversationService, AgentService, CustomerService, ConversationHelper,MessageService],
})
export class ConversationModule {}
