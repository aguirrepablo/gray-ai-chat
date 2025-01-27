import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiHelper } from './gemini.helper';
import { ConversationModule } from 'src/conversation/conversation.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [ConversationModule, SharedModule],
  providers: [GeminiService, GeminiHelper],
  exports:[GeminiService, GeminiHelper]
})
export class GeminiModule {}
