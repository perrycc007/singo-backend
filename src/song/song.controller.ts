import { Controller, Post, Get, Param,Query, Body, UseGuards, Request } from '@nestjs/common';
import { SongService } from './song.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('song')
export class SongController {
  constructor(private songService: SongService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSong(@Body() body, @Request() req) {
    const userId = req.user.id;
    return this.songService.createSong({ ...body, userId });
  }

    // @UseGuards(JwtAuthGuard)
  @Get('user-songs')
  async getUserSongs(@Request() req) {
    // const userId = req.user.userId;
    const userId = 1
    console.log(userId)
    return this.songService.getUserSongs(userId);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('details')
  async getSongDetails(
    @Query('songId') songId: any,
    @Request() req
  ) {
    // const userId = req.user.userId;
    const userId = 2
    return this.songService.getSongLevelsAndProgress(userId, parseInt(songId));
  }



}
