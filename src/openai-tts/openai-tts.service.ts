// src/openai-tts/openai-tts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { Song } from '@prisma/client';
import { QuestionGenerationService } from 'src/question/question.service';
@Injectable()
export class OpenaiTtsService {
  private openai: OpenAI;
  private ttsClient: TextToSpeechClient;
  private questionGenerationService: QuestionGenerationService
  private readonly logger = new Logger(OpenaiTtsService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({ apiKey: configService.get('OPENAI_API_KEY') });
    this.ttsClient = new TextToSpeechClient({
      projectId: configService.get('GOOGLE_CLOUD_PROJECT_ID'),
      keyFilename: configService.get('GOOGLE_CLOUD_KEY_FILENAME'),
    });
  }

  async generateLyricsDataAndAudio(userId: number, lyrics: string): Promise<{ songUrl: string , songId: number}> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Translate the following Japanese song lyrics into English, ignore any english word, only focus on japanese words, provide Romanized pronunciation, extract vocabulary with English meanings and Romanized pronunciation, and format everything into a structured JSON. Here is the reference and format of the desired outcome: {
  "song": {
    "id": "unique_song_id",
    "title": "Song Title",
    "artist": "Artist Name",
    "lyrics": [
      {
        "line": "Japanese sentence",
        "translation": "English translation",
        "pronunciation": "Romanized pronunciation",
        "vocabulary": [
          {
            "word": "word1",
            "meaning": "English meaning",
            "pronunciation": "Romanized pronunciation",
            "audioUrl": "URL to word audio file"
          },
          {
            "word": "word2",
            "meaning": "English meaning",
            "pronunciation": "Romanized pronunciation",
            "audioUrl": "URL to word audio file"
          },
          {
            "word": "word3",
            "meaning": "English meaning",
            "pronunciation": "Romanized pronunciation",
            "audioUrl": "URL to word audio file"
          }
        ],
        "audioUrl": "URL to sentence audio file"
      }
    ]
  }
}
 Here are the lyrics:\n\n${lyrics}

`,
        },
      ],
    });
    console.log(response.choices[0].message.content);
    const songData = JSON.parse(response.choices[0].message.content);

    const songId = `song-${Date.now()}`;

    await this.processAudioFiles(songData, songId);

    // Save songData to the database
    const savedSong = await this.saveSongData(songData, userId);

    // Construct the URL
    const songUrl = `${this.configService.get('FRONTEND_BASE_URL')}/song?id=${savedSong.id}`;

    return { songUrl:songUrl, songId: savedSong.id };
  }

  async processAudioFiles(songData: any, songId: string) {
    const audioDir = path.join(__dirname, '..', 'public', 'audio', songId);
    fs.mkdirSync(audioDir, { recursive: true });

    for (const line of songData.song.lyrics) {
      line.audioUrl = await this.synthesizeSpeech(
        line.line,
        'ja-JP',
        protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL,
        `${audioDir}/sentence-${line.id}.mp3`,
      );

      for (const vocab of line.vocabulary) {
        vocab.audioUrl = await this.synthesizeSpeech(
          vocab.word,
          'ja-JP',
          protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL,
          `${audioDir}/vocab-${vocab.id}.mp3`,
        );
      }
    }
  }

  async synthesizeSpeech(
    text: string,
    languageCode: string,
    ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender,
    outputFile: string,
  ): Promise<string> {
    try {
      // const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      //   {
      //     input: { text },
      //     voice: { languageCode, ssmlGender },
      //     audioConfig: {
      //       audioEncoding:
      //         protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      //     },
      //   };

      // this.logger.log(`Synthesizing speech for text: "${text}"`);
      // const [response] = await this.ttsClient.synthesizeSpeech(request);

      // if (!response.audioContent) {
      //   this.logger.error('No audio content received from Text-to-Speech API');
      //   throw new Error('No audio content received');
      // }

      // const writeFile = util.promisify(fs.writeFile);
      // this.logger.log(`Writing audio file to: ${outputFile}`);
      // await writeFile(outputFile, response.audioContent, 'binary');

      // this.logger.log(`Audio file saved successfully: ${outputFile}`);
      return outputFile.replace(__dirname, '');
    } catch (error) {
      this.logger.error(`Error synthesizing speech: ${error.message}`);
      throw error;
    }
  }

  async saveSongData(songData: any, userId: number): Promise<Song> {
    const song = await this.prisma.song.create({
      data: {
        title: songData.song.title,
        artist: songData.song.artist,
        users: {
          connect: { id: userId },
        },
        sentences: {
          create: songData.song.lyrics.map((line: any) => ({
            line: line.line,
            translation: line.translation,
            pronunciation: line.pronunciation,
            // audioUrl: line.audioUrl,
            audioUrl: '1',
            vocabularies: {
              create: line.vocabulary.map((vocab: any) => ({
                word: vocab.word,
                meaning: vocab.meaning,
                pronunciation: vocab.pronunciation,
                // audioUrl: vocab.audioUrl,
                audioUrl: '1',
              })),
            },
          })),
        },
      },
    });
    await this.prisma.progress.create({
      data: {
        userId: userId,
        songId: song.id,
        currentLevel: 1,
        currentStep: 1,
        currentPractice: 1,
        lastPracticeDate: new Date(),
        createdAt: new Date(),
      },
    });
    // await this.questionGenerationService.generateQuestionsForSong(songData.id);
    this.logger.log(`Song data saved successfully: ${song.id}`);
    return song;
  }
  
}
