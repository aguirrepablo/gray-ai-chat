import { ContentMessage } from "../entities/content-message.entitie";
import { MessageType } from "../enums/message-type.enum";
import { SenderType } from "../enums/sender-type.enum";
import { Agent } from "../schemas/agent.schema";
import { Customer } from "../schemas/customer.schema";

export class CreateMessageDto {
    content: ContentMessage[] | any;
    type?: MessageType;
    sender: Customer | Agent;
    senderType: SenderType;
  }