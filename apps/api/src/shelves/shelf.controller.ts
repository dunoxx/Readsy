import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ShelfService } from './shelf.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddBookToShelfDto } from './dto/add-book-to-shelf.dto';
import { ReorderBooksDto } from './dto/reorder-books.dto';
import { UpdateBookOnShelfDto } from './dto/update-book-on-shelf.dto';

@Controller('api/v1/shelves')
@UseGuards(JwtAuthGuard)
export class ShelfController {
  constructor(private readonly shelfService: ShelfService) {}

  @Get()
  async findAll(@Req() req) {
    return this.shelfService.findAll(req.user.userId);
  }

  @Get('public/:userId')
  async findPublicByUser(@Param('userId') userId: string) {
    return this.shelfService.findPublicByUser(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req, @Body(ValidationPipe) dto: CreateShelfDto) {
    return this.shelfService.create(req.user.userId, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.shelfService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Req() req, @Body(ValidationPipe) dto: UpdateShelfDto) {
    return this.shelfService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req) {
    await this.shelfService.remove(id, req.user.userId);
    return;
  }

  @Post(':id/books')
  async addBookToShelf(@Param('id') id: string, @Req() req, @Body(ValidationPipe) dto: AddBookToShelfDto) {
    return this.shelfService.addBookToShelf(id, req.user.userId, dto);
  }

  @Delete(':id/books/:bookId')
  async removeBookFromShelf(@Param('id') id: string, @Param('bookId') bookId: string, @Req() req) {
    return this.shelfService.removeBookFromShelf(id, req.user.userId, bookId);
  }

  @Post(':id/books/reorder')
  async reorderBooks(@Param('id') id: string, @Req() req, @Body(ValidationPipe) dto: ReorderBooksDto) {
    return this.shelfService.reorderBooks(id, req.user.userId, dto);
  }

  @Get(':id/books')
  async getBooksFromShelf(@Param('id') id: string, @Req() req) {
    return this.shelfService.getBooksFromShelf(id, req.user.userId);
  }

  @Patch(':id/books/:bookId')
  async updateBookOnShelf(@Param('id') id: string, @Param('bookId') bookId: string, @Req() req, @Body(ValidationPipe) dto: UpdateBookOnShelfDto) {
    return this.shelfService.updateBookOnShelf(id, bookId, req.user.userId, dto);
  }
} 