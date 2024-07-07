import { Module } from '@nestjs/common';
import { OpenaiTtsController } from './openai-tts.controller';
import { OpenaiTtsService } from './openai-tts.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [OpenaiTtsController],
  providers: [OpenaiTtsService],
})
export class OpenaiTtsModule {}
