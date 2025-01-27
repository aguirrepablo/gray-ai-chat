import { Module, Global } from '@nestjs/common';
import { BuilderbotService } from './builderbot.service';
import { GeminiModule } from 'src/gemini/gemini.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Global()
@Module({
  imports: [ConversationModule, GeminiModule],
  providers: [BuilderbotService],
})
export class BuilderbotModule { }