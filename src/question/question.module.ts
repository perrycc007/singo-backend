import { Module } from '@nestjs/common';
import { QuestionGenerationService } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  providers: [QuestionGenerationService],
  controllers: [QuestionController]
})
export class QuestionModule {}
