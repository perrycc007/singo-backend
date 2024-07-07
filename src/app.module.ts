import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OpenaiTtsService } from './openai-tts/openai-tts.service';
import { OpenaiTtsController } from './openai-tts/openai-tts.controller';
import { OpenaiTtsModule } from './openai-tts/openai-tts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SongsController } from './songs/songs.controller';
import { SongsModule } from './songs/songs.module';
import { PrismaService } from './prisma/prisma.service';
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
  ],
  controllers: [SongsController,OpenaiTtsController],
  providers: [OpenaiTtsService,PrismaService],
})
export class AppModule {}
