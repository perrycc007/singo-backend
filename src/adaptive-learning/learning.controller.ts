import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('learning')
export class LearningController {
  constructor(private learningService: LearningService) {}

  @UseGuards(JwtAuthGuard)
  @Post('complete-practice')
  async completePractice(@Request() req, @Body() body) {
    const { songId, currentLevel, currentStep, currentPractice, practiceIndex, questionResults } = body;
    const progress = await this.learningService.completePracticeSession(
      req.user.userId,
      songId,
      currentLevel,
      currentStep,
      currentPractice,
      practiceIndex,
      questionResults,
    );
    return progress;
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-practice')
  async getPractice(@Request() req, @Body() body) {
    const { songId } = body;
    const nextLevel = await this.learningService.getPractice(req.user.userId, songId);
    return { nextLevel };
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-revision-questions')
  async getRevisionQuestions(@Request() req, @Body() body) {
    const { songId } = body;
    const questions = await this.learningService.getRevisionQuestions(req.user.userId, songId);
    return { questions };
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-song-and-progress')
  async getSongAndProgress(@Request() req, @Body() body) {
    const { songId } = body;
    const songAndProgress = await this.learningService.getSongAndProgress(req.user.userId, songId);
    return songAndProgress;
  }
}
