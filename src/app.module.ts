import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OpenaiTtsService } from './openai-tts/openai-tts.service';
import { OpenaiTtsController } from './openai-tts/openai-tts.controller';
import { OpenaiTtsModule } from './openai-tts/openai-tts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SongController } from './song/song.controller';
import { SongModule } from './song/song.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { LearningModule } from './adaptive-learning/learning.module';
import { QuestionGenerationService } from './question/question.service';
import { SongService } from './song/song.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    SongModule,
    OpenaiTtsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/audio',
    }),
    AuthModule,
    UserModule,
    QuestionModule,
    LearningModule,
    
  ],
  controllers: [SongController,OpenaiTtsController],
  providers: [OpenaiTtsService,PrismaService,SongService],
})
export class AppModule {}
