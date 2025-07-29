import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SuggestBookDto } from './dto/suggest-book.dto';
import { SuggestedBookResponseDto } from './dto/suggested-book-response.dto';

@Injectable()
export class SuggestedBookService {
  constructor(private readonly prisma: PrismaService) {}

  async suggestBook(userId: string, dto: SuggestBookDto): Promise<SuggestedBookResponseDto> {
    const suggestedBook = await this.prisma.suggestedBook.create({
      data: {
        title: dto.title,
        author: dto.author,
        isbn: dto.isbn,
        publisher: dto.publisher,
        totalPages: dto.totalPages,
        edition: dto.edition,
        coverUrl: dto.coverUrl,
        suggestedById: userId,
      },
    });

    return this.toResponseDto(suggestedBook);
  }

  async findAll(status?: string): Promise<SuggestedBookResponseDto[]> {
    const where = status ? { status } : {};
    const suggestedBooks = await this.prisma.suggestedBook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        suggestedBy: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });

    return suggestedBooks.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<SuggestedBookResponseDto> {
    const suggestedBook = await this.prisma.suggestedBook.findUnique({
      where: { id },
      include: {
        suggestedBy: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });

    if (!suggestedBook) {
      throw new NotFoundException('Sugestão de livro não encontrada');
    }

    return this.toResponseDto(suggestedBook);
  }

  async approve(id: string, reviewerId: string, notes?: string): Promise<SuggestedBookResponseDto> {
    const suggestedBook = await this.prisma.suggestedBook.findUnique({
      where: { id },
    });

    if (!suggestedBook) {
      throw new NotFoundException('Sugestão de livro não encontrada');
    }

    if (suggestedBook.status !== 'pending') {
      throw new BadRequestException('Sugestão já foi revisada');
    }

    // Criar o livro na tabela principal
    const book = await this.prisma.book.create({
      data: {
        title: suggestedBook.title,
        author: suggestedBook.author,
        isbn: suggestedBook.isbn,
        category: suggestedBook.publisher,
        coverUrl: suggestedBook.coverUrl,
        totalPages: suggestedBook.totalPages || 0,
        addedById: suggestedBook.suggestedById,
      },
    });

    // Atualizar status da sugestão
    const updatedSuggestedBook = await this.prisma.suggestedBook.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
      include: {
        suggestedBy: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });

    return this.toResponseDto(updatedSuggestedBook);
  }

  async reject(id: string, reviewerId: string, notes: string): Promise<SuggestedBookResponseDto> {
    const suggestedBook = await this.prisma.suggestedBook.findUnique({
      where: { id },
    });

    if (!suggestedBook) {
      throw new NotFoundException('Sugestão de livro não encontrada');
    }

    if (suggestedBook.status !== 'pending') {
      throw new BadRequestException('Sugestão já foi revisada');
    }

    const updatedSuggestedBook = await this.prisma.suggestedBook.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
      include: {
        suggestedBy: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });

    return this.toResponseDto(updatedSuggestedBook);
  }

  private toResponseDto(suggestedBook: any): SuggestedBookResponseDto {
    return {
      id: suggestedBook.id,
      title: suggestedBook.title,
      author: suggestedBook.author,
      isbn: suggestedBook.isbn,
      publisher: suggestedBook.publisher,
      totalPages: suggestedBook.totalPages,
      edition: suggestedBook.edition,
      coverUrl: suggestedBook.coverUrl,
      status: suggestedBook.status,
      suggestedById: suggestedBook.suggestedById,
      reviewedBy: suggestedBook.reviewedBy,
      reviewedAt: suggestedBook.reviewedAt,
      reviewNotes: suggestedBook.reviewNotes,
      createdAt: suggestedBook.createdAt,
      updatedAt: suggestedBook.updatedAt,
    };
  }
} 