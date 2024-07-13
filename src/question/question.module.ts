import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionGenerationService } from './question.service';

@Module({
  imports: [PrismaModule],
  providers: [QuestionGenerationService],
  exports: [QuestionGenerationService],
})
export class QuestionModule {}
