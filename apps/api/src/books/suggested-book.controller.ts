import { Controller, Post, Get, Param, Body, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { SuggestedBookService } from './suggested-book.service';
import { SuggestBookDto } from './dto/suggest-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/suggested-books')
@UseGuards(JwtAuthGuard)
export class SuggestedBookController {
  constructor(private readonly suggestedBookService: SuggestedBookService) {}

  @Post()
  async suggestBook(@Req() req, @Body(ValidationPipe) dto: SuggestBookDto) {
    return this.suggestedBookService.suggestBook(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req) {
    // TODO: Adicionar verificação de admin
    return this.suggestedBookService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    // TODO: Adicionar verificação de admin
    return this.suggestedBookService.findOne(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req, @Body() body: { notes?: string }) {
    // TODO: Adicionar verificação de admin
    return this.suggestedBookService.approve(id, req.user.userId, body.notes);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Req() req, @Body() body: { notes: string }) {
    // TODO: Adicionar verificação de admin
    return this.suggestedBookService.reject(id, req.user.userId, body.notes);
  }
} 