import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionGenerationService {
  constructor(private prisma: PrismaService) {}

  async generateQuestionsForSong(songId: number) {
    // Fetch sentences and vocabularies for the song
    const sentences = await this.prisma.sentence.findMany({
      where: { songId },
      include: { vocabularies: true },
    });

    const questions = [];

    for (const sentence of sentences) {
      // Generate translation question
      questions.push({
        practiceId: null, // will be assigned later
        text: `Translate the following sentence: ${sentence.line}`,
        type: 'sentence-formation-translation',
        sentenceId: sentence.id,
      });

      // Generate meaning question
      questions.push({
        practiceId: null, // will be assigned later
        text: `What is the meaning of the sentence: ${sentence.translation}?`,
        type: 'sentence-formation-meaning',
        sentenceId: sentence.id,
      });

      // Generate audio-based sentence formation questions
      questions.push({
        practiceId: null, // will be assigned later
        text: `Listen to the audio and form the correct sentence.`,
        type: 'sentence-formation',
        sentenceId: sentence.id,
        audioUrl: sentence.audioUrl,
      });

      // Generate vocabulary questions
      for (const vocab of sentence.vocabularies) {
        questions.push({
          practiceId: null, // will be assigned later
          text: `What is the meaning of the word: ${vocab.word}?`,
          type: 'vocabulary-meaning',
          vocabularyId: vocab.id,
        });

        questions.push({
          practiceId: null, // will be assigned later
          text: `What is the pronunciation of the word: ${vocab.word}?`,
          type: 'vocabulary-pronunciation',
          vocabularyId: vocab.id,
        });

        questions.push({
          practiceId: null, // will be assigned later
          text: `Listen to the audio and identify the word.`,
          type: 'vocabulary-audio',
          vocabularyId: vocab.id,
        });

        questions.push({
          practiceId: null, // will be assigned later
          text: `Which word carries this meaning: ${vocab.meaning}`,
          type: 'vocabulary-word',
          vocabularyId: vocab.id,
        });
      }
    }

    // Get all steps for the song's levels


    const totalSteps = 15;
    const stepAssignments = Array.from({ length: totalSteps }, () => []);

    // Distribute questions across steps
    let stepIndex = 0;
    for (const question of questions) {
      stepAssignments[stepIndex].push(question);
      stepIndex = (stepIndex + 1) % totalSteps;
    }

    // Save questions to the database and assign stepIds
    for (let i = 0; i < totalSteps; i++) {
      const order = i;
      const questionsWithNumber = stepAssignments[i].map((question) => ({
        ...question,
        order,
      }));

      await this.prisma.question.createMany({
        data: questionsWithNumber,
      });
    }
  }
}
