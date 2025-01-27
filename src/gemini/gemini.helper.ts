import { Injectable, Logger } from '@nestjs/common';
import { AIHelper } from 'src/shared/interfaces/ai-helper.interface';
import { Conversation } from 'src/conversation/schemas/conversation.schema';
import { SenderType } from 'src/conversation/enums/sender-type.enum';
import { Role } from './enums/role.enum';
import { Content, Part, TextPart} from '@google/generative-ai';
import { GeminiService } from './gemini.service';
import { MessageArray } from 'src/conversation/utils/message-array';
import { MessageType } from 'src/conversation/enums/message-type.enum';
import { ConversationHelper } from 'src/conversation/conversation.helper';

@Injectable()
export class GeminiHelper implements AIHelper<Content> {
    private readonly logger = new Logger(GeminiHelper.name);

    constructor(
        private readonly conversationHelper: ConversationHelper,
        private readonly geminiService: GeminiService,
    ) { }

    
    async processMessages(messages: MessageArray, conversation: Conversation, sendChatMessageCallback): Promise<any> {
        try {
            const historyMessageFormat = await this.formatMessages(messages, conversation);
            const responseAI = await this.geminiService.getGenerativeModel(historyMessageFormat, conversation.assignedAgent.prompt)

            // console.log("Response AI > ", responseAI);

            const that = this;

            async function processInternalResponse(currentResponse) {
                await sendChatMessageCallback(conversation.customer.externalId, currentResponse.text().trim());
                // historicalMessages.push(await that.geminiHelper.formatMessage("Gemini", contentMessage, currentResponse.usageMetadata));
                messages.push(await that.conversationHelper.generateNewMessage(conversation, MessageType.TEXT, responseAI, SenderType.AGENT));

                // //procesando calls funtion.
                // if (calls.length !== 0) {
                //     for (const call of calls) {
                //         console.log("CALL > ", call);
                //         that.fromErrorProcesar = "API_Segurarse";
                //         const toolResponse = await that.runTool(call.name, call.args);

                //         historicalMessages.push(await that.geminiHelper.formatMessage("API_Segurarse", [
                //             {
                //                 type: "tool_result",
                //                 name: call.name,
                //                 content: typeof toolResponse === "string" ? JSON.stringify({
                //                     response: toolResponse
                //                 }) : JSON.stringify(toolResponse),
                //                 tool_use_id: "-",
                //                 is_error: false //toolResponse.errores ? true : false,
                //             },
                //         ]));

                //         //Se envia la respuesta a gemini
                //         that.fromErrorProcesar = "Gemini";
                //         const responseToolResult = await that.sendMessagesToGemini(prompt, await that.geminiHelper.getHistoryMessagesFormat(historicalMessages));
                //         processInternalResponse(responseToolResult);
                //     }
                // }
            }
            await processInternalResponse(responseAI);

        } catch (error) {
            this.logger.error(error);
            throw error;
        }

    }

    async formatMessages(messages: MessageArray, conversation: Conversation): Promise<Content[]> {
        try {
            const result: Content[] = [];
;
            messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            if (messages) {
                for (const message of messages) {
                    var role = "";

                    switch (message.senderType) {
                        case SenderType.CUSTOMER:
                            role = Role.user.toString();
                            break;
                        case SenderType.AGENT:
                            role = Role.model.toString();
                            break;
                    }

                    const content: Content = {
                        role: role,
                        parts: await this.formatContent(message.content, message.type, message.senderType)
                    };

                    console.log("Sender : ", message.senderType, " > content : ", content, message.createdAt);
                    
                    result.push(content);
                }
            }

            return result;

        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async formatContent(contentMessage: any[], messageType : MessageType , senderType: SenderType): Promise<any[]> {
        const parts: Part[] = [];
        for (const content of contentMessage) {
            switch (senderType) {
                case SenderType.CUSTOMER:
                    parts.push({ text: content.text } as TextPart);
                    break;
                case SenderType.AGENT:
                    switch (messageType) {
                        // case "file":
                        //     const file = await this.fileService.findOne(content.fileId.toString());
                        //     const contentImage = {
                        //         inlineData: {
                        //             mimeType: file.mediaType,
                        //             data: file.base64.toString('base64')
                        //         }
                        //     };
                        //     contentArray.push(contentImage);
                        //     contentArray.push({ text: content.text })
                        //     if (content.text) {
                        //         contentArray.push({ text: content.text })
                        //     }
                        //     break;
                        case MessageType.TEXT:
                            if (content) {
                                if (content.candidates) {
                                    parts.push({ text: content.candidates[0].content.parts[0].text } as TextPart);
                                    
                                } else {
                                    parts.push({ text: "Respuesta sin datos." } as TextPart);
                                }
                            } else {
                                parts.push({ text: "Respuesta con error." } as TextPart);
                            }
                            break
                        // case "tool_use":
                        //     parts.push({
                        //         functionCall: {
                        //             name: content.name,
                        //             args: content.input
                        //         }
                        //     } as FunctionCallPart);
                        //     break
                        // case "tool_result":
                        //     parts.push({
                        //         functionCall: {
                        //             name: content.name,
                        //             response: JSON.parse(content.content)
                        //         }
                        //     } as FunctionResponsePart);
                        //     break
                    }
                    break;
            }
            
        }
        return parts;
    }

}