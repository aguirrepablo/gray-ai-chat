import { Injectable, Logger } from '@nestjs/common';
import { AIHelper } from 'src/shared/interfaces/ai-helper.interface';
import { Conversation } from 'src/conversation/schemas/conversation.schema';
import { SenderType } from 'src/conversation/enums/sender-type.enum';
import { Role } from './enums/role.enum';
import { Content, Part, TextPart } from '@google/generative-ai';
import { GeminiService } from './gemini.service';
import { MessageArray } from 'src/conversation/utils/message-array';
import { MessageType } from 'src/conversation/enums/message-type.enum';
import { ConversationHelper } from 'src/conversation/conversation.helper';
import { ChannelType } from 'src/conversation/enums/channel-type.enum';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

            const prompt =
                `conversation_id: ${conversation._id}
            ` + conversation.assignedAgent.prompt;

            const responseAI = await this.geminiService.getGenerativeModel(historyMessageFormat, prompt)

            const that = this;

            async function processInternalResponse(currentResponse) {

                await sendChatMessageCallback(conversation.customer.externalId, currentResponse.text().trim());
                messages.push(await that.conversationHelper.generateNewMessage(conversation, MessageType.TEXT, responseAI, SenderType.AGENT));

                //procesando calls funtion.
                const calls = currentResponse.functionCalls() || [];

                if (calls.length !== 0) {
                    for (const call of calls) {
                        const toolResponse = await that.runTools(call.name, call.args);
                        const toolResponseContent = {
                            name: call.name,
                            args: call.args,
                            response: toolResponse
                        }

                        messages.push(await that.conversationHelper.generateNewMessage(conversation, MessageType.TOOL_RESULT, toolResponseContent, SenderType.TOOL_RESULT));

                        //Se envia la respuesta a gemini
                        const responseToolResult = await that.geminiService.getGenerativeModel(await that.formatMessages(messages, conversation), prompt)
                        processInternalResponse(responseToolResult);
                    }
                }
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

                    if (message == undefined) continue;

                    var role = "";
                    switch (message.senderType) {

                        case SenderType.TOOL_RESULT:
                        case SenderType.CUSTOMER:
                            role = Role.user.toString();
                            break;
                        case SenderType.AGENT:
                            role = Role.model.toString();
                            break;
                    }

                    const content: Content = {
                        role: role,
                        parts: await this.formatContent(message.content, message.type, message.senderType, conversation.channel)
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

    async formatContent(contentMessage: any[], messageType: MessageType, senderType: SenderType, channel: ChannelType): Promise<any[]> {
        const parts: Part[] = [];
        for (const content of contentMessage) {
            switch (senderType) {
                case SenderType.CUSTOMER:
                    if (channel == ChannelType.TELEGRAM) {
                        parts.push({ text: content.text } as TextPart);
                    }
                    if (channel == ChannelType.BUILDERBOT) {
                        parts.push({ text: content.body } as TextPart);
                    }

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
                                    content.candidates.forEach((candidato: any) => {
                                        candidato.content.parts.map(function (part: any) {
                                            parts.push(part);
                                        });
                                    });
                                } else {
                                    parts.push({ text: "Respuesta sin datos." } as TextPart);
                                }
                            } else {
                                parts.push({ text: "Respuesta con error." } as TextPart);
                            }
                            break
                        case MessageType.TOOL_CALL:
                            parts.push({
                                functionCall: {
                                    name: content.name,
                                    args: content.input
                                }
                            });
                            break
                    }
                    break;
                case SenderType.TOOL_RESULT:
                    console.log("content > > > ", content);
                    parts.push({
                        functionResponse: {
                            name: content.name,
                            response: content.response
                        }
                    });
                    break
            }

        }
        return parts;
    }

    async runTools(functionName: string, args: any) {

        var response;

        switch (functionName) {
            case "close_conversation":
                try {
                    response = { message: "La conversación se cerro correctamente.", };
                } catch (error) {
                    response = { message: "No se pudo cerrar la conversación.", error: error };
                }
                break;
            case "disable_conversation_agent":
                try {
                    await this.conversationHelper.deactivateAgentConversation(args.conversationId);
                    response = { message: "La conversación se marco como completa correctamente.", };
                } catch (error) {
                    response = { message: "No se pudo marcar como completa la conversación.", error: error };
                }
                break;
            case "get_data_link":
                try {
                    try {
                        const gerResponse = await axios.get(args.link);
                        const html = gerResponse.data;
                        const $ = cheerio.load(html);
                        const metaDescription = $('meta[name="description"]').attr('content');
                        response = { data: metaDescription || null }; ;
                      } catch (error) {
                        console.error('Error al obtener o analizar la página:', error);
                        response = { data: null}; ;
                      }
                } catch (error) {
                    response = { message: "No se pudo consultar la web", error: JSON.stringify(error) };
                }
                break;
            default:
                response = { message: "No se encuentro tools con ese nombre" };
        }

        return response;
    }


}