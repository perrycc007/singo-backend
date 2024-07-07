import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

@Injectable()
export class OpenaiTtsService {
  private openai: OpenAI;
  private ttsClient: TextToSpeechClient;
  private readonly logger = new Logger(OpenaiTtsService.name);

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({ apiKey: configService.get('OPENAI_API_KEY') });
    this.ttsClient = new TextToSpeechClient({
      projectId: configService.get('GOOGLE_CLOUD_PROJECT_ID'),
      keyFilename: configService.get('GOOGLE_CLOUD_KEY_FILENAME'),
    });
  }

  async generateLyricsDataAndAudio(lyrics: string): Promise<any> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Translate the following Japanese song lyrics into English, provide Romanized pronunciation, extract vocabulary with English meanings and Romanized pronunciation, and format everything into a structured JSON. here is the reference and format of the desired outcome: {
  "song": {
    "id": "unique_song_id",
    "title": "Song Title",
    "artist": "Artist Name",
    "lyrics": [
      {
        "id": "unique_sentence_id1",
        "line": "Japanese sentence",
        "translation": "English translation",
        "pronunciation": "Romanized pronunciation",
        "vocabulary": [
          {
            "id": "unique_vocab_id1",
            "word": "word1",
            "meaning": "English meaning",
            "pronunciation": "Romanized pronunciation",
            "audioUrl": "URL to word audio file"
          },
          {
            "id": "unique_vocab_id2",
            "word": "word2",
            "meaning": "English meaning",
            "pronunciation": "Romanized pronunciation",
            "audioUrl": "URL to word audio file"
          },
          {
            "id": "unique_vocab_id3",
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

    const songData = JSON.parse(response.choices[0].message.content);
    console.log(songData);
    const songId = `song-${Date.now()}`;

    await this.processAudioFiles(songData, songId);

    return songData;
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
      const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
        {
          input: { text },
          voice: { languageCode, ssmlGender },
          audioConfig: {
            audioEncoding:
              protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
          },
        };

      this.logger.log(`Synthesizing speech for text: "${text}"`);
      const [response] = await this.ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        this.logger.error('No audio content received from Text-to-Speech API');
        throw new Error('No audio content received');
      }

      const writeFile = util.promisify(fs.writeFile);
      this.logger.log(`Writing audio file to: ${outputFile}`);
      await writeFile(outputFile, response.audioContent, 'binary');

      this.logger.log(`Audio file saved successfully: ${outputFile}`);
      return outputFile.replace(__dirname, '');
    } catch (error) {
      this.logger.error(`Error synthesizing speech: ${error.message}`);
      throw error;
    }
  }
}
