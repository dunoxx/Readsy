import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserFavoriteDto, UpdateUserFavoriteDto, UserFavoriteResponseDto } from './dto/user-favorite.dto';

@Injectable()
export class UserFavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async addToFavorites(userId: string, bookId: string, dto?: CreateUserFavoriteDto): Promise<UserFavoriteResponseDto> {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    // Verificar se já está nos favoritos
    const existing = await this.prisma.userFavorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      throw new ConflictException('Livro já está nos favoritos');
    }

    const userFavorite = await this.prisma.userFavorite.create({
      data: {
        userId,
        bookId,
        rating: dto?.rating,
        read: dto?.read || false,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverUrl: true,
            category: true,
            totalPages: true,
          },
        },
      },
    });

    return this.toResponseDto(userFavorite);
  }

  async removeFromFavorites(userId: string, bookId: string): Promise<void> {
    const userFavorite = await this.prisma.userFavorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (!userFavorite) {
      throw new NotFoundException('Livro não está nos favoritos');
    }

    await this.prisma.userFavorite.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  async getFavorites(userId: string): Promise<UserFavoriteResponseDto[]> {
    const userFavorites = await this.prisma.userFavorite.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverUrl: true,
            category: true,
            totalPages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return userFavorites.map((item) => this.toResponseDto(item));
  }

  async updateFavorite(userId: string, bookId: string, dto: UpdateUserFavoriteDto): Promise<UserFavoriteResponseDto> {
    const userFavorite = await this.prisma.userFavorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverUrl: true,
            category: true,
            totalPages: true,
          },
        },
      },
    });

    if (!userFavorite) {
      throw new NotFoundException('Livro não está nos favoritos');
    }

    const updated = await this.prisma.userFavorite.update({
      where: { userId_bookId: { userId, bookId } },
      data: {
        rating: dto.rating,
        read: dto.read,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverUrl: true,
            category: true,
            totalPages: true,
          },
        },
      },
    });

    return this.toResponseDto(updated);
  }

  async isFavorite(userId: string, bookId: string): Promise<boolean> {
    const userFavorite = await this.prisma.userFavorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    return !!userFavorite;
  }

  private toResponseDto(userFavorite: any): UserFavoriteResponseDto {
    return {
      id: userFavorite.id,
      userId: userFavorite.userId,
      bookId: userFavorite.bookId,
      rating: userFavorite.rating,
      read: userFavorite.read,
      createdAt: userFavorite.createdAt,
      book: userFavorite.book,
    };
  }
} 