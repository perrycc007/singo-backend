import { Module } from '@nestjs/common';
import { SongController } from './song.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SongController],
})
export class SongsModule {}
