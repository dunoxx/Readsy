import { Controller, Post, Body, Req, UseGuards, ValidationPipe, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UploadAudioDto } from './dto/upload-audio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/checkins')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req, @Body(ValidationPipe) dto: CreateCheckinDto) {
    return this.checkinService.create(req.user.userId, dto);
  }

  @Post('audio')
  async uploadAudio(@Req() req, @Body(ValidationPipe) dto: UploadAudioDto) {
    return this.checkinService.uploadAudio(req.user.userId, dto);
  }

  @Post('history/:bookId')
  async history(@Req() req, @Param('bookId') bookId: string) {
    return this.checkinService.history(req.user.userId, bookId);
  }

  @Post('stats')
  async stats(@Req() req) {
    return this.checkinService.getUserStats(req.user.userId);
  }
} 