import { Module } from '@nestjs/common';
import { AdaptiveLearningService } from './adaptive-learning.service';
import { AdaptiveLearningController } from './adaptive-learning.controller';

@Module({
  providers: [AdaptiveLearningService],
  controllers: [AdaptiveLearningController]
})
export class AdaptiveLearningModule {}
