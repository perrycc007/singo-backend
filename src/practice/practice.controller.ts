import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { AdaptiveLearningService } from '../adaptive-learning/adaptive-learning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('practice')
export class PracticeController {
  constructor(
    private practiceService: PracticeService,
    private adaptiveLearningService: AdaptiveLearningService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('complete')
  async completePractice(@Request() req, @Body() body) {
    const { songId, levelId,currentLevelNumber, stepId, order,completedExercises, practiceId, correctAnswers, totalQuestions } = body;
    const progress = await this.practiceService.completePracticeSession(
      req.user.userId,
      songId,
      levelId,
      currentLevelNumber,
      stepId,
      order,
      completedExercises,
      practiceId,
      correctAnswers,
      totalQuestions,
    );
    await this.adaptiveLearningService.scheduleReviews(req.user.userId, songId);
    return progress;
  }

  @UseGuards(JwtAuthGuard)
  @Post('next-level')
  async getNextLevel(@Request() req, @Body() body) {
    const { songId } = body;
    const nextLevel = await this.adaptiveLearningService.getNextLevel(req.user.userId, songId);
    return { nextLevel };
  }
}
