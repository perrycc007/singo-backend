import { Module } from '@nestjs/common';
import { OpenaiTtsController } from './openai-tts.controller';
import { OpenaiTtsService } from './openai-tts.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [OpenaiTtsController],
  providers: [OpenaiTtsService],
})
export class OpenaiTtsModule {}
