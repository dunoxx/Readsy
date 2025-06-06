import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [BooksService, PrismaService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {} 