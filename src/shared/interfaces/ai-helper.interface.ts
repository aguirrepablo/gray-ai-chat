import { Conversation } from "src/conversation/schemas/conversation.schema";
import { Message } from "src/conversation/schemas/message.schema";
import { MessageArray } from "src/conversation/utils/message-array";

export interface AIHelper<TMessage> {
    processMessages(messages : MessageArray, conversation : Conversation, sendChatMessageCallback): Promise<any>; // Define los métodos base que los helpers deben implementar
    formatMessages(messages : MessageArray, conversation : Conversation) : Promise<TMessage[]>
}