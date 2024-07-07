// songs.controller.ts
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SongData } from './types';

@Controller('songs')
export class SongsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async getSongById(@Param('id') id: string): Promise<SongData> {
    const song = await this.prisma.song.findUnique({
      where: { id: parseInt(id) },
      include: {
        sentences: {
          include: {
            vocabularies: true,
          },
        },
      },
    });

    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    return song;
  }
}
