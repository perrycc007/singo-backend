import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AdaptiveLearningService } from './adaptive-learning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('adaptive-learning')
export class AdaptiveLearningController {
  constructor(private adaptiveLearningService: AdaptiveLearningService) {}

  @UseGuards(JwtAuthGuard)
  @Post('next-level')
  async getNextLevel(@Request() req, @Body() body) {
    const { songId } = body;
    const nextLevel = await this.adaptiveLearningService.getNextLevel(req.user.userId, songId);
    return { nextLevel };
  }

  @UseGuards(JwtAuthGuard)
  @Post('schedule-reviews')
  async scheduleReviews(@Request() req, @Body() body) {
    const { songId } = body;
    await this.adaptiveLearningService.scheduleReviews(req.user.userId, songId);
    return { message: 'Reviews scheduled successfully' };
  }
}
