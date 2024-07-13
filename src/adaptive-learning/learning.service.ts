import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays } from 'date-fns';

interface QuestionResult {
  wrongFrequency: number;
  questionId: number;
}

@Injectable()
export class LearningService {
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

  async completePracticeSession(
    userId: number,
    songId: number,
    currentLevel: number,
    currentStep: number,
    currentPractice: number,
    practiceIndex: number,
    questionResults: QuestionResult[]
  ) {
    if (currentPractice === 6) {
      currentPractice = 1;
      practiceIndex += 1;
      if (practiceIndex === 15) {
        practiceIndex = 1;
        if (currentLevel === 20) {
          currentLevel = 20;
        } else {
          currentLevel += 1;
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
      const halfLife = this.calculateHalfLife(new Date(), accuracy);
      const nextReviewDate = this.calculateNextReviewDate(new Date(), halfLife);

      if (progressQuestion) {
        await this.prisma.progressQuestion.update({
          where: {
            id: progressQuestion.id,
          },
          data: {
            frequency: frequency,
            wrongFrequency: wrongFrequency,
            lastEncounter: new Date(),
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
            lastEncounter: new Date(),
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

  async getPractice(userId: number, songId: number, level: number,step:number) {
    // Fetch user's progress

 

    // Fetch the next questions based on level and step

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

    let { currentLevel, currentStep, currentPractice } = progress;
    const vocabulary = await this.prisma.vocabulary.findMany({
      take: 30, // Number of vocabulary items to fetch
    });

    if (currentLevel>level){
      const questions = await this.prisma.question.findMany({
        where: {
          songId,
          level: level,
          step: step,
        },
        include: {
          Sentence: {
            include: {
              vocabularies: true,  // Include vocabularies within the sentence
            },
          },
          Vocabulary: true,
        },
      });
      return { questions, vocabulary };
    }else if(currentStep>step){
      const questions = await this.prisma.question.findMany({
        where: {
          songId,
          level: level,
          step: step,
        },
        include: {
          Sentence: {
            include: {
              vocabularies: true,  // Include vocabularies within the sentence
            },
          },
          Vocabulary: true,
        },
      });
      return { questions, vocabulary };
      }else{
        const questions = await this.prisma.question.findMany({
          where: {
            songId,
            level: level,
            step: step,
            practiceNumber : currentPractice
          },
          include: {
            Sentence: {
              include: {
                vocabularies: true,  // Include vocabularies within the sentence
              },
            },
            Vocabulary: true,
          },
        });
        return { questions, vocabulary };
      }
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
