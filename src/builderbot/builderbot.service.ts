import { Injectable, OnModuleInit } from '@nestjs/common';
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot';
import { MongoAdapter as Database } from '@builderbot/database-mongo';
import { BaileysProvider } from '@builderbot/provider-baileys'
import { GeminiHelper } from 'src/gemini/gemini.helper';
import { ConversationHelper } from 'src/conversation/conversation.helper';
import { MessageType } from 'src/conversation/enums/message-type.enum';
import { SenderType } from 'src/conversation/enums/sender-type.enum';
import { ChannelType } from 'src/conversation/enums/channel-type.enum';
import { ConversationStatus } from 'src/conversation/enums/conversation-status.enum';

@Injectable()
export class BuilderbotService implements OnModuleInit {

  constructor(private readonly conversationHelper: ConversationHelper, private readonly geminiHelper: GeminiHelper) { }

  private bot: any;

  private messageBuffer: Record<string, { buffer: string[]; timer?: NodeJS.Timeout }> = {};
  private timeoutDuration = 5000; // Tiempo de espera (8 segundos)

  private onReceiveMessage = addKeyword<BaileysProvider, Database>("")
    .addAction(async (ctx: any) => {
      
      console.log(ctx);
      const { from, body } = ctx

      if (!this.messageBuffer[from]) {
        this.messageBuffer[from] = { buffer: [], timer: undefined };
      }

      this.messageBuffer[from].buffer.push(body);

      if (this.messageBuffer[from].timer) {
        clearTimeout(this.messageBuffer[from].timer);
      }

      this.messageBuffer[from].timer = setTimeout(async () => {
        const fullMessage = this.messageBuffer[from].buffer.join(' ');
        this.messageBuffer[from].buffer = []; // Limpiamos el buffer después de procesarlo
        delete this.messageBuffer[from].timer; // Eliminamos el temporizador

        const conversation = await this.conversationHelper.findOrCreateConversation(from, ChannelType.BUILDERBOT);
        const messageHistory = await this.conversationHelper.getArrayMessage(conversation);

        ctx.body = fullMessage;

        messageHistory.push(await this.conversationHelper.generateNewMessage(conversation, MessageType.TEXT, ctx, SenderType.CUSTOMER));

        if(conversation.status == ConversationStatus.AGENT_DESACTIVATED) return;
        
        await this.geminiHelper.processMessages(messageHistory, conversation, this.sendMessage);
;
      }, this.timeoutDuration);

      try {

      } catch (error) {

      }
      // await this.bot.sendMessage(number, body, {})
    })

  sendMessage = async (from: string, body: string) => {
    await this.bot.provider.sendMessage(from, body, {})
  }

  async onModuleInit() {
    console.log("Conectando builderbot ...");

    const adapterFlow = createFlow([this.onReceiveMessage])
    const adapterProvider = createProvider(BaileysProvider)
    const adapterDB = new Database({
      dbUri: "mongodb+srv://admin:0TOSFaYkV8QSFt6V@cluster0.z4ayn.mongodb.net/",
      dbName: "gray-ai-db",
    })

    try {
      this.bot = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
      })

      this.bot.httpServer(process.env.BUILDERBOT_PORT);

    } catch (error) {
      console.error("No se pudo levantar builderbot.", error);
    }
  }
}