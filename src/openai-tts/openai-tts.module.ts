import { Module } from '@nestjs/common';
import { OpenaiTtsController } from './openai-tts.controller';
import { OpenaiTtsService } from './openai-tts.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionGenerationService } from 'src/question/question.service';
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [OpenaiTtsController],
  providers: [OpenaiTtsService,QuestionGenerationService],
})
export class OpenaiTtsModule {}
