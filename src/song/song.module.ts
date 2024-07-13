import { Module } from '@nestjs/common';
import { SongController } from './song.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SongService } from './song.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Module({
  imports: [ConfigModule, PrismaModule,AuthModule, ],
  controllers: [SongController],
  providers: [SongService, PrismaService],
})
export class SongModule {}
