import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongService {
  constructor(private prisma: PrismaService) {}

  async createSong(data: any) {
    return this.prisma.song.create({
      data,
    });
  }

  async getSongById(id: number) {
    return this.prisma.song.findUnique({
      where: { id },
      include: {
        sentences: {
          include: {
            vocabularies: true,
          },
        },
      },
    });
  }

  async getUserSongs(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        songs: true,
      },
    });
  }
  
}
