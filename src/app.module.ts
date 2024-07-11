import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OpenaiTtsService } from './openai-tts/openai-tts.service';
import { OpenaiTtsController } from './openai-tts/openai-tts.controller';
import { OpenaiTtsModule } from './openai-tts/openai-tts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SongController } from './songs/song.controller';
import { SongsModule } from './songs/song.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { PracticeModule } from './practice/practice.module';
import { AdaptiveLearningModule } from './adaptive-learning/adaptive-learning.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    SongsModule,
    OpenaiTtsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/audio',
    }),
    AuthModule,
    UserModule,
    QuestionModule,
    PracticeModule,
    AdaptiveLearningModule,
  ],
  controllers: [SongController,OpenaiTtsController],
  providers: [OpenaiTtsService,PrismaService],
})
export class AppModule {}
