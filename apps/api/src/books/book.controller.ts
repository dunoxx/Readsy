import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateBookIsbnDto } from './dto/create-book-isbn.dto';
import { SearchBookDto } from './dto/search-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('search')
  async search(@Query(ValidationPipe) query: SearchBookDto) {
    return this.bookService.searchBooks(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req, @Body(ValidationPipe) dto: CreateBookDto) {
    return this.bookService.create(req.user.userId, dto);
  }

  @Post('isbn')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createByIsbn(@Req() req, @Body(ValidationPipe) dto: CreateBookIsbnDto) {
    return this.bookService.createByIsbn(req.user.userId, dto);
  }
} 