import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenaiModule } from './openai/openai.module';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from './gemini/gemini.module';
import { BuilderbotModule } from './builderbot/builderbot.module';
import { ConversationModule } from './conversation/conversation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true}), MongooseModule.forRoot(`${process.env.MONGO_URL}/${process.env.MONGO_DB}`), BuilderbotModule, OpenaiModule, TelegramModule, GeminiModule, ConversationModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
