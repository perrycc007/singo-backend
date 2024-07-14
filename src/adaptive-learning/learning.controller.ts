import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('learning')
export class LearningController {
  constructor(private learningService: LearningService) {}

  @UseGuards(JwtAuthGuard)
  @Post('complete-practice')
  async completePractice(@Request() req, @Body() body) {
    const userId = 1
    // const userId = req.user.userId
    const { songId, currentLevel, currentStep, currentPractice, practiceIndex, questionResults } = body;
    const progress = await this.learningService.completePracticeSession(
      userId,
      parseInt(songId),
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
    const { songId,level,step} = body;
    const userId = 1
    // const userId = req.user.userId
    const {  questions, vocabulary } = await this.learningService.getPractice(userId, parseInt(songId),parseInt(level),parseInt(step));
    return { questions, vocabulary };
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-revision-questions')
  async getRevisionQuestions(@Request() req, @Body() body) {
    const { songId } = body;
    const userId = 1
    // const userId = req.user.userId
    const questions = await this.learningService.getRevisionQuestions(userId,  parseInt(songId));
    return { questions };
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-song-and-progress')
  async getSongAndProgress(@Request() req, @Body() body) {
    const { songId } = body;
    const userId = 1
    // const userId = req.user.userId
    const songAndProgress = await this.learningService.getSongAndProgress(userId,  parseInt(songId));
    return songAndProgress;
  }
}
