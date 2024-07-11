import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdaptiveLearningService } from '../adaptive-learning/adaptive-learning.service';

@Injectable()
export class PracticeService {
  constructor(
    private prisma: PrismaService,
    private adaptiveLearningService: AdaptiveLearningService
  ) {}

  async completePracticeSession(
    userId: number,
    songId: number,
    levelId: number,
    currentLevelNumber: number,
    stepId: number,
    order: number,
    completedExercises: number,
    practiceId: number,
    correctAnswers: number,
    totalQuestions: number,
  ) {
    // Calculate accuracy
    const accuracy = (correctAnswers / totalQuestions) * 100;
    if (completedExercises === 6) {
      completedExercises = 1;
      order += 1;
      if (order === 15) {
        order = 1;
        
        if (currentLevelNumber==20){
          currentLevelNumber ==20
        } else{
          currentLevelNumber += 1;
        }
      }
    }
    // Find or create Progress record
    let progress = await this.prisma.progress.findFirst({
      where: {
          userId,
          songId,
      },
    });

    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          songId,
          currentLevel: currentLevelNumber,
          currentStep: order,
          completedExercises: 1,
          lastPracticeDate: new Date(),
        },
      });
    } else {
      progress = await this.prisma.progress.update({
        where: {
          id: progress.id,
        },
        data: {
          currentLevel: currentLevelNumber,
          currentStep: order,
          completedExercises: completedExercises, 
          lastPracticeDate: new Date(),
        },
      });
    }

    // Find or create ProgressStep record
    let progressStep = await this.prisma.progressStep.findFirst({
      where: {
          progressId: progress.id,
          stepId: stepId,
      },
    });

    if (!progressStep) {
      progressStep = await this.prisma.progressStep.create({
        data: {
          progressId: progress.id,
          stepId,
          accuracy,
          lastEncounter: new Date(),
        },
      });
    } else {
      progressStep = await this.prisma.progressStep.update({
        where: {
          id: progressStep.id,
        },
        data: {
          accuracy,
          lastEncounter: new Date(),
        },
      });
    }

    // Update or create ProgressQuestion records
    const questions = await this.prisma.question.findMany({
      where: {
        stepId,
      },
    });

    for (const question of questions) {
      const halfLife = this.adaptiveLearningService.calculateHalfLife(new Date(), accuracy);
      const nextReviewDate = this.adaptiveLearningService.calculateNextReviewDate(new Date(), halfLife);

      let progressQuestion = await this.prisma.progressQuestion.findFirst({
        where: {
            progressStepId: progressStep.id,
            questionId: question.id,
        },
      });

      if (!progressQuestion) {
        progressQuestion = await this.prisma.progressQuestion.create({
          data: {
            progressStepId: progressStep.id,
            questionId: question.id,
            accuracy,
            frequency: 1,
            lastEncounter: new Date(),
            halfLife,
            nextScheduledRevision: nextReviewDate,
            userId: userId
          },
        });
      } else {
        progressQuestion = await this.prisma.progressQuestion.update({
          where: {
            id: progressQuestion.id,
          },
          data: {
            accuracy,
            frequency: progressQuestion.frequency + 1,
            lastEncounter: new Date(),
            halfLife,
            nextScheduledRevision: nextReviewDate,
          },
        });
      }
    }

    return {
      progress,
      progressStep,
    };
  }
}
