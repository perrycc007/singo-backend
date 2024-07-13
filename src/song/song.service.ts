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

  async getSongLevelsAndProgress(userId: number, songId: number) {

    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: {
        question: true,
      },
    });
    console.log(song,'hi')
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId,
        songId,
      },
    });
    
    if (!song || !song.question) {
      throw new Error('Song or questions not found');
    }

    // Group questions by level and step
    const levels = {};
    for (const question of song.question) {
      const level = question.level;
      const step = question.step;

      if (!levels[level]) {
        levels[level] = { maxStep: 0 };
      }

      if (step > levels[level].maxStep) {
        levels[level].maxStep = step;
      }
    }

    const levelsArray = Object.keys(levels).map((level) => ({
      level: parseInt(level),
      maxStep: levels[level].maxStep,
    }));
    console.log( { song, progress, levels: levelsArray })
    return { song, progress, levels: levelsArray };
  }
}
