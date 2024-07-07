import { Controller, Post, Body } from '@nestjs/common';
import { OpenaiTtsService } from './openai-tts.service';

@Controller('openai-tts')
export class OpenaiTtsController {
  constructor(private readonly openaiTtsService: OpenaiTtsService) {}

  @Post('generate')
  async generateLyricsData(@Body('lyrics') lyrics: string) {
    console.log('start generate')
    const result = await this.openaiTtsService.generateLyricsDataAndAudio(lyrics);
    return result;
  }
}
