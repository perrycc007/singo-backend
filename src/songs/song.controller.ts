import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SongService } from './songs.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('songs')
export class SongController {
  constructor(private songService: SongService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSong(@Body() body, @Request() req) {
    const userId = req.user.id;
    return this.songService.createSong({ ...body, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSongById(@Param('id') id: number) {
    return this.songService.getSongById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserSongs(@Param('userId') userId: number) {
    return this.songService.getUserSongs(userId);
  }
}
