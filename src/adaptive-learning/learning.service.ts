import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addMinutes, addHours, addDays } from 'date-fns';

interface QuestionResult {
  wrongFrequency: number;
  questionId: number;
}

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  // Calculate the half-life of a question
  calculateHalfLife(lastEncounter: Date, features: number[], weights: number[]): number {
    const dotProduct = features.reduce((sum, feature, i) => sum + feature * weights[i], 0);
    return Math.pow(2, dotProduct);
}

  // Calculate the next review date based on half-life, frequency, and accuracy
  calculateNextReviewDate(lastEncounter: Date, frequency: number, complexity: number, weights: number[]): Date {
    // Define repetition intervals
    const baseIntervals = [0.5, 4, 24, 72, 336, 1320, 3600, 8640,
      17280, 34560, 69120, 138240, 276480, 552960, 1105920, 2211840, 4423680, 8847360, 17694720, 35389440, 70778880, 141557760, 283115520, 566231040, 1132462080]; // in hours

    let nextInterval;
    if (frequency <= baseIntervals.length) {
        // nextInterval = baseIntervals[frequency - 1];
        const halfLife = this.calculateHalfLife(lastEncounter, [complexity], weights);
        const days = halfLife * Math.log2(2);
        nextInterval = days * baseIntervals[frequency - 1]
    } else {
        const halfLife = this.calculateHalfLife(lastEncounter, [complexity], weights);
        const days = halfLife * Math.log2(2);
        nextInterval = days * 1132462080; // convert days to hours
    }

    // Adjust nextInterval based on complexity: higher complexity => shorter interval

    return addDays(lastEncounter, nextInterval / 24);
}


  async completePracticeSession(
    userId: number,
    songId: number,
    level: number,
    step: number,
    practice: number,
    practiceIndex: number,
    questionResults: QuestionResult[]
  ) {







    // Find or create Progress record
    let progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        songId,
      },
    });
    let currentPractice = progress.currentPractice
    let currentStep = progress.currentStep
    let currentLevel = progress.currentLevel
    if (level == currentLevel && step == currentStep ){
      if (currentPractice === 6) {
        currentPractice = 1;
        currentStep += 1;
        if (currentStep >= 15) {
          currentPractice = 1;
          currentStep = 1
          if (currentLevel === 20) {
            currentLevel = 20;
          } else {
            currentLevel += 1;
          }
        }
      }else{
        currentPractice += 1
      }
    }


    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          songId,
          currentLevel: currentLevel,
          currentStep: practiceIndex,
          currentPractice: 1,
          lastPracticeDate: new Date(),
        },
      });
    } else {
      progress = await this.prisma.progress.update({
        where: {
          id: progress.id,
        },
        data: {
          currentLevel: currentLevel,
          currentStep: practiceIndex,
          currentPractice: currentPractice,
          lastPracticeDate: new Date(),
        },
      });
    }

    // Update or create ProgressQuestion records
    const questionIds = questionResults.map(result => result.questionId);
    const existingProgressQuestions = await this.prisma.progressQuestion.findMany({
      where: {
        userId: userId,
        questionId: { in: questionIds },
      },
    });

    const progressQuestionsMap = new Map(
      existingProgressQuestions.map(pq => [pq.questionId, pq])
    );

    for (const result of questionResults) {
      const questionId = result.questionId;
      const questionWrongFrequency = result.wrongFrequency;

      const progressQuestion = progressQuestionsMap.get(questionId);
      const frequency = progressQuestion ? progressQuestion.frequency + 1 : 1;
      const wrongFrequency = progressQuestion ? progressQuestion.wrongFrequency + questionWrongFrequency : questionWrongFrequency;
      const accuracy = ((frequency - wrongFrequency) / frequency) * 100;
      const complexity = wrongFrequency*3/frequency ?wrongFrequency*3/frequency:0.1;
      // Ensure the lastEncounter date is valid
      const lastEncounter = new Date();
      if (isNaN(lastEncounter.getTime())) {
        throw new Error(`Invalid lastEncounter date: ${lastEncounter}`);
      }
 // example complexity value
      const weights = [0.3];
      const halfLife = this.calculateHalfLife(lastEncounter,[complexity],weights)
      const nextReviewDate = this.calculateNextReviewDate(lastEncounter, frequency, complexity, weights);
      if (isNaN(nextReviewDate.getTime())) {
        throw new Error(`Invalid nextScheduledRevision date: ${nextReviewDate}`);
      }

      if (progressQuestion) {
        await this.prisma.progressQuestion.update({
          where: {
            id: progressQuestion.id,
          },
          data: {
            frequency: frequency,
            wrongFrequency: wrongFrequency,
            lastEncounter: lastEncounter,
            halfLife,
            nextScheduledRevision: nextReviewDate,
          },
        });
      } else {
        await this.prisma.progressQuestion.create({
          data: {
            userId: userId,
            questionId: questionId,
            frequency: 1,
            wrongFrequency: questionWrongFrequency,
            lastEncounter: lastEncounter,
            halfLife,
            nextScheduledRevision: nextReviewDate,
          },
        });
      }
    }

    return {
      progress,
    };
  }

  async getPractice(userId: number, songId: number, level: number, step: number) {
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        songId,
      },
    });

    if (!progress) {
      throw new Error('Progress not found for the user and song');
    }

    let { currentLevel, currentStep, currentPractice } = progress;
    const vocabulary = await this.prisma.vocabulary.findMany({
      take: 30,
    });

    let questions;
    if (currentLevel > level) {
      questions = await this.prisma.question.findMany({
        where: {
          songId,
          level: level,
          step: step,
        },
        include: {
          Sentence: {
            include: {
              vocabularies: true,
            },
          },
          Vocabulary: true,
        },
      });
    } else if (currentStep > step) {
      questions = await this.prisma.question.findMany({
        where: {
          songId,
          level: level,
          step: step,
        },
        include: {
          Sentence: {
            include: {
              vocabularies: true,
            },
          },
          Vocabulary: true,
        },
      });
    } else {
      questions = await this.prisma.question.findMany({
        where: {
          songId,
          level: level,
          step: step,
          practiceNumber: currentPractice,
        },
        include: {
          Sentence: {
            include: {
              vocabularies: true,
            },
          },
          Vocabulary: true,
        },
      });
    }
    return { questions, vocabulary };
  }

  async getRevisionQuestions(userId: number, songId: number) {
    const questions = await this.prisma.progressQuestion.findMany({
      where: {
        userId,
        question: {
          songId,
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

  async getSongAndProgress(userId: number, songId: number) {
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: {
        question: true,
      },
    });

    const progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        songId,
      },
    });

    return { song, progress };
  }
}
