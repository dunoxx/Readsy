import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto, userId: string) {
    return this.prisma.book.create({
      data: {
        ...createBookDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.book.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto, userId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  async remove(id: string, userId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.prisma.book.delete({
      where: { id },
    });
  }
} 