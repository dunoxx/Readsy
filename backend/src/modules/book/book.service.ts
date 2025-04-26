import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os livros
  async findAll() {
    return this.prisma.book.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  // Buscar livro por ID
  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${id} não encontrado`);
    }

    return book;
  }

  // Criar novo livro
  async create(createBookDto: CreateBookDto, userId: string) {
    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        coverImage: createBookDto.coverImage,
        isbn: createBookDto.isbn,
        pages: createBookDto.pages,
        createdBy: {
          connect: { id: userId },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  // Atualizar livro
  async update(id: string, updateBookDto: UpdateBookDto) {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${id} não encontrado`);
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        title: updateBookDto.title,
        author: updateBookDto.author,
        coverImage: updateBookDto.coverImage,
        isbn: updateBookDto.isbn,
        pages: updateBookDto.pages,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  // Deletar livro
  async remove(id: string) {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${id} não encontrado`);
    }

    await this.prisma.book.delete({
      where: { id },
    });

    return { message: 'Livro removido com sucesso' };
  }
} 