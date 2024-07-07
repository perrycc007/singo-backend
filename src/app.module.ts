import { Module } from '@nestjs/common';
import { OpenaiTtsModule } from './openai-tts/openai-tts.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), OpenaiTtsModule],
})
export class AppModule {}
