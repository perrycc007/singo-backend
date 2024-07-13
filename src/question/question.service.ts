import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionGenerationService {
  constructor(private prisma: PrismaService) {}

  async generateQuestionsForSong(songId: number) {
    const sentences = await this.prisma.sentence.findMany({
      where: { songId },
      include: { vocabularies: true },
    });

    const totalLevels = 20;
    const stepsPerLevel = 10;
    const practicesPerStep = 6;
    const sentencesPerBatch = 3;
    const questionsPerStep = 90;
    const questionsPerPractice = 15;

    let levelIndex = 1;
    let stepIndex = 1;
    let practiceIndex = 1;

    for (let i = 0; i < sentences.length; i += sentencesPerBatch) {
      const sentenceBatch = sentences.slice(i, i + sentencesPerBatch);

      // Generate questions for the current batch of sentences
      const questions = this.generateQuestions(sentenceBatch);

      // Distribute questions across practices, steps, and levels
      let questionIndex = 0;
      while (questionIndex < questions.length) {
        const practiceQuestions = questions.slice(questionIndex, questionIndex + questionsPerPractice);

        for (const question of practiceQuestions) {
          await this.saveQuestion(
            songId,
            question,
            levelIndex,
            stepIndex,
            practiceIndex
          );
        }

        questionIndex += questionsPerPractice;
        practiceIndex++;

        if (practiceIndex > practicesPerStep) {
          practiceIndex = 1;
          stepIndex++;

          if (stepIndex > stepsPerLevel) {
            stepIndex = 1;
            levelIndex++;

            if (levelIndex > totalLevels) {
              return; // Stop if we have filled all levels
            }
          }
        }
      }
    }
  }

  generateQuestions(sentences: any[]): any[] {
    const questions = [];
    sentences.forEach((sentence) => {
      questions.push(
        {
          text: `Translate the following sentence: ${sentence.line}`,
          type: 'sentence-formation-translation',
          sentenceId: sentence.id,
          correctAnswer: sentence.translation,
        },
        {
          text: `What sentence has this meaning: ${sentence.translation}?`,
          type: 'sentence-formation-meaning',
          sentenceId: sentence.id,
          correctAnswer: sentence.line,
        },
        {
          text: `Listen to the audio and form the correct sentence.`,
          type: 'sentence-formation',
          sentenceId: sentence.id,
          audioUrl: sentence.audioUrl,
          correctAnswer: sentence.line,
        }
      );

      sentence.vocabularies.forEach((vocab) => {
        questions.push(
          {
            text: `What is the meaning of the word: ${vocab.word}?`,
            type: 'vocabulary-meaning',
            vocabularyId: vocab.id,
            correctAnswer: vocab.meaning,
          },
          {
            text: `What is the pronunciation of the word: ${vocab.word}?`,
            type: 'vocabulary-pronunciation',
            vocabularyId: vocab.id,
            correctAnswer: vocab.pronunciation,
          },
          {
            text: `Listen to the audio and identify the word.`,
            type: 'vocabulary-audio',
            vocabularyId: vocab.id,
            correctAnswer: vocab.word,
          },
          {
            text: `Which word carries this meaning: ${vocab.meaning}`,
            type: 'vocabulary-word',
            vocabularyId: vocab.id,
            correctAnswer: vocab.word,
          },
          {
            text: `Listen to the audio and identify the meaning.`,
            type: 'vocabulary-audio',
            vocabularyId: vocab.id,
            correctAnswer: vocab.meaning,
          },
        );
      });
    });
    return questions;
  }

  async saveQuestion(
    songId: number,
    question: any,
    level: number,
    step: number,
    practice: number
  ) {
    await this.prisma.question.create({
      data: {
        songId,
        text: question.text,
        type: question.type,
        practiceNumber: practice,
        level: level,
        step: step,
        correctAnswer: question.correctAnswer,
        sentenceId: question.sentenceId,
        vocabularyId: question.vocabularyId,
      },
    });
  }
}
