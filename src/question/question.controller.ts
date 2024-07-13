import { Controller, Post, Get, Param } from '@nestjs/common';
import { QuestionGenerationService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionGenerationService) {}

  @Get('generate/:songId')
  async createQuestionsForSong(@Param('songId') songId: number) {
    return this.questionService.generateQuestionsForSong(songId);
  }
}
