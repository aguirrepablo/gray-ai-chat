import { Module } from '@nestjs/common';
import { WebchatService } from './webchat.service';
import { WebchatController } from './webchat.controller';

@Module({
  controllers: [WebchatController],
  providers: [WebchatService],
})
export class WebchatModule {}
