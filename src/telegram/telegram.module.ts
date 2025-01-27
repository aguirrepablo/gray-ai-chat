import { Module,Global} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConversationModule } from 'src/conversation/conversation.module';
import { GeminiModule } from 'src/gemini/gemini.module';

@Global()
@Module({
  imports: [ConversationModule, GeminiModule],
  providers: [TelegramService]
})
export class TelegramModule {}
