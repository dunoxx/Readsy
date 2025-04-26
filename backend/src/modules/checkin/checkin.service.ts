import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCheckinDto } from './dtos/create-checkin.dto';

@Injectable()
export class CheckinService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os checkins
  async findAll() {
    return this.prisma.checkin.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Buscar checkins de um usuário específico
  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.checkin.findMany({
      where: {
        userId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Buscar checkin por ID
  async findOne(id: string) {
    const checkin = await this.prisma.checkin.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    if (!checkin) {
      throw new NotFoundException(`Checkin com ID ${id} não encontrado`);
    }

    return checkin;
  }

  // Criar novo checkin
  async create(userId: string, createCheckinDto: CreateCheckinDto) {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: createCheckinDto.bookId },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${createCheckinDto.bookId} não encontrado`);
    }

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se páginas lidas não excedem o total do livro (se o livro tiver total de páginas)
    if (book.pages && createCheckinDto.pagesRead > book.pages) {
      throw new BadRequestException(`O número de páginas lidas (${createCheckinDto.pagesRead}) excede o total do livro (${book.pages})`);
    }

    // Verificar se currentPage não excede o total do livro (se o livro tiver total de páginas)
    if (book.pages && createCheckinDto.currentPage && createCheckinDto.currentPage > book.pages) {
      throw new BadRequestException(`A página atual (${createCheckinDto.currentPage}) excede o total do livro (${book.pages})`);
    }

    return this.prisma.checkin.create({
      data: {
        user: {
          connect: { id: userId },
        },
        book: {
          connect: { id: createCheckinDto.bookId },
        },
        pagesRead: createCheckinDto.pagesRead,
        minutesSpent: createCheckinDto.minutesSpent,
        currentPage: createCheckinDto.currentPage,
        audioNoteUrl: createCheckinDto.audioNoteUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });
  }

  // Remover checkin
  async remove(id: string) {
    const checkin = await this.prisma.checkin.findUnique({
      where: { id },
    });

    if (!checkin) {
      throw new NotFoundException(`Checkin com ID ${id} não encontrado`);
    }

    await this.prisma.checkin.delete({
      where: { id },
    });

    return { message: 'Checkin removido com sucesso' };
  }
} 