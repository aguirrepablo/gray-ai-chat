import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ConversationHelper } from 'src/conversation/conversation.helper';
import { ChannelType } from 'src/conversation/enums/channel-type.enum';
import { ConversationStatus } from 'src/conversation/enums/conversation-status.enum';
import { MessageType } from 'src/conversation/enums/message-type.enum';
import { SenderType } from 'src/conversation/enums/sender-type.enum';
import { GeminiHelper } from 'src/gemini/gemini.helper';

@Injectable()
export class TelegramService {
    private telegranToken = process.env.TELEGRAM_BOT_TOKEN;
    private bot: any;

    private userBuffers: Record<string, { buffer: string[]; timer?: NodeJS.Timeout }> = {};
    private timeoutDuration = 5000; // Tiempo de espera (8 segundos)

    constructor(private readonly conversationHelper: ConversationHelper, private readonly geminiHelper: GeminiHelper) {
        this.bot = new TelegramBot(this.telegranToken, { polling: true });
        this.bot.on("message", this.onReceiveMessage)
    }

    onReceiveMessage = async (message: any) => {
        const identifierChannel = message.chat.id.toString();

        if (!this.userBuffers[identifierChannel]) {
            this.userBuffers[identifierChannel] = { buffer: [], timer: undefined };
        }

        this.userBuffers[identifierChannel].buffer.push(message.text);

        // Cancelamos cualquier temporizador activo
        if (this.userBuffers[identifierChannel].timer) {
            clearTimeout(this.userBuffers[identifierChannel].timer);
        }

        // Configuramos un nuevo temporizador que reinicia desde el último mensaje recibido
        this.userBuffers[identifierChannel].timer = setTimeout(async () => {
            const fullMessage = this.userBuffers[identifierChannel].buffer.join(' ');
            this.userBuffers[identifierChannel].buffer = []; // Limpiamos el buffer después de procesarlo
            delete this.userBuffers[identifierChannel].timer; // Eliminamos el temporizador

            //A partir de aca hcer todo:
            const conversation = await this.conversationHelper.findOrCreateConversation(identifierChannel, ChannelType.TELEGRAM);
            const messageHistory = await this.conversationHelper.getArrayMessage(conversation);

            console.log("messageHistory >>> ", messageHistory);
            message.text = fullMessage;

            messageHistory.push(await this.conversationHelper.generateNewMessage(conversation, MessageType.TEXT, message, SenderType.CUSTOMER));

            if(conversation.status == ConversationStatus.AGENT_DESACTIVATED) return;

            this.bot.sendChatAction(identifierChannel, "typing");

            await this.geminiHelper.processMessages(messageHistory, conversation, this.sendMessage);
        }, this.timeoutDuration);
    }

    sendMessage = async (identifierChannel : string, mensaje : string) => {
        this.bot.sendMessage(identifierChannel, mensaje);
    }
}
