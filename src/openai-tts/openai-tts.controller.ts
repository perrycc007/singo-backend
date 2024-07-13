import { Controller, Post,Req, Body ,UseGuards} from '@nestjs/common';
import { OpenaiTtsService } from './openai-tts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserId } from '../auth/user-id.decorator';
import { QuestionGenerationService } from 'src/question/question.service';
@Controller('openai-tts')
export class OpenaiTtsController {
  constructor(private readonly openaiTtsService: OpenaiTtsService,
    private questionService: QuestionGenerationService
  ) {}
 
  // @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateLyricsData(@Req() req: any, @Body('lyrics') lyrics: string) {
    console.log('start generate')
    // const userId = req.user.userId;
    const userId = 1;
    const result = await this.openaiTtsService.generateLyricsDataAndAudio(userId,lyrics);
    await this.questionService.generateQuestionsForSong(result.songId);
    
    return result.songUrl;
  }
}
