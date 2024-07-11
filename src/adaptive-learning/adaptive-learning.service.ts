import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays } from 'date-fns';

@Injectable()
export class AdaptiveLearningService {
  constructor(private prisma: PrismaService) {}

  // Calculate the half-life of a question
  calculateHalfLife(lastEncounter: Date, accuracy: number): number {
    const delta = (new Date().getTime() - new Date(lastEncounter).getTime()) / (1000 * 60 * 60 * 24); // days
    const p = accuracy / 100;
    return -delta / Math.log2(p);
  }

  // Estimate recall probability using the half-life
  estimateRecallProbability(lastEncounter: Date, halfLife: number): number {
    const delta = (new Date().getTime() - new Date(lastEncounter).getTime()) / (1000 * 60 * 60 * 24); // days
    return Math.pow(2, -delta / halfLife);
  }

  // Determine next review time based on recall probability
  calculateNextReviewDate(lastEncounter: Date, halfLife: number): Date {
    const nextInterval = halfLife * Math.log2(2); // Simplified, you may adjust intervals
    return addDays(lastEncounter, nextInterval);
  }

  async scheduleReviews(userId: number, songId: number) {
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        songId,
      },
      include: {
        steps: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!progress) {
      throw new Error('Progress not found for the user and song');
    }

    for (const step of progress.steps) {
      for (const question of step.questions) {
        const halfLife = this.calculateHalfLife(question.lastEncounter, question.accuracy);
        const nextReviewDate = this.calculateNextReviewDate(question.lastEncounter, halfLife);

        await this.prisma.progressQuestion.update({
          where: {
            id: question.id,
          },
          data: {
            halfLife,
            nextScheduledRevision: nextReviewDate,
          },
        });
      }
    }
  }

  async getNextLevel(userId: number, songId: number) {
    // Fetch user's progress
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        songId,
      },
    });

    if (!progress) {
      throw new Error('Progress not found for the user and song');
    }

    let { currentLevel, currentStep, completedExercises } = progress;

    // Fetch the next level
    const nextLevel = await this.prisma.level.findFirst({
      where: {
        songId,
        number: currentLevel,
      },
      include: {
        steps: {
          include: {
            questions: {
              include: {
                Sentence: true,
                Vocabulary: true,
              },
            },
          },
        },
      },
    });

    if (!nextLevel) {
      throw new Error('Next level not found');
    }

    // Extract the next step and questions
    const nextStep = nextLevel.steps.find(step => step.number === currentStep);
    if (!nextStep) {
      throw new Error('Next step not found');
    }
    const questions = nextStep.questions;

    return {
      nextLevel,
      nextStep,
      questions,
      completedExercises,
    };
  }

  async getRevisionQuestions(userId: number, songId: number) {
    const questions = await this.prisma.progressQuestion.findMany({
      where: {
        userId,
        question: {
          step: {
            level: {
              songId,
            },
          },
        },
        nextScheduledRevision: {
          lte: new Date(),
        },
      },
      include: {
        question: {
          include: {
            Sentence: true,
            Vocabulary: true,
          },
        },
      },
      orderBy: {
        nextScheduledRevision: 'asc',
      },
      take: 15,
    });

    return questions;
  }
}
