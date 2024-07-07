import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SongsController],
})
export class SongsModule {}
