import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExternalBookService } from './services/external-book.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookController],
  providers: [BookService, ExternalBookService],
  exports: [BookService],
})
export class BookModule {} 