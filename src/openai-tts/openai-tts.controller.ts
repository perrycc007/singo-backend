import { Controller, Post, Body } from '@nestjs/common';
import { OpenaiTtsService } from './openai-tts.service';

@Controller('openai-tts')
export class OpenaiTtsController {
  constructor(private readonly openaiTtsService: OpenaiTtsService) {}

  @Post('generate')
  async generate(@Body('lyrics') lyrics: string) {
    console.log('hello');
    return await this.openaiTtsService.generateLyricsDataAndAudio(lyrics);
  }
}
