import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserWishlistResponseDto } from './dto/user-wishlist.dto';

@Injectable()
export class UserWishlistService {
  private readonly AMAZON_AFFILIATE_TAG = 'dunoxx-20'; // Tag de afiliado padrão

  constructor(private readonly prisma: PrismaService) {}

  async addToWishlist(userId: string, bookId: string): Promise<UserWishlistResponseDto> {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    // Verificar se já está na wishlist
    const existing = await this.prisma.userWishlist.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing) {
      throw new ConflictException('Livro já está na lista de desejos');
    }

    const userWishlist = await this.prisma.userWishlist.create({
      data: {
        userId,
        bookId,
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

    return this.toResponseDto(userWishlist);
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<void> {
    const userWishlist = await this.prisma.userWishlist.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (!userWishlist) {
      throw new NotFoundException('Livro não está na lista de desejos');
    }

    await this.prisma.userWishlist.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  async getWishlist(userId: string): Promise<UserWishlistResponseDto[]> {
    const userWishlist = await this.prisma.userWishlist.findMany({
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

    return userWishlist.map((item) => this.toResponseDto(item));
  }

  async isInWishlist(userId: string, bookId: string): Promise<boolean> {
    const userWishlist = await this.prisma.userWishlist.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    return !!userWishlist;
  }

  async generateWishlistSlug(userId: string): Promise<string> {
    console.log('Gerando slug para usuário:', userId);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, wishlistSlug: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    console.log('Usuário encontrado:', user.username, 'Slug atual:', user.wishlistSlug);

    // Se já tem slug, retorna
    if (user.wishlistSlug) {
      console.log('Retornando slug existente:', user.wishlistSlug);
      return user.wishlistSlug;
    }

    // Gerar slug baseado no username
    let slug = user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
    console.log('Slug gerado:', slug);
    
    // Verificar se já existe
    let counter = 1;
    let finalSlug = slug;
    
    while (await this.prisma.user.findFirst({ where: { wishlistSlug: finalSlug } })) {
      finalSlug = `${slug}${counter}`;
      counter++;
    }

    console.log('Slug final:', finalSlug);

    // Salvar o slug
    await this.prisma.user.update({
      where: { id: userId },
      data: { wishlistSlug: finalSlug },
    });

    console.log('Slug salvo no banco');
    return finalSlug;
  }

  async getWishlistSlug(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { wishlistSlug: true },
    });

    return user?.wishlistSlug || null;
  }

  private generateAmazonUrl(isbn13?: string): string | undefined {
    if (!isbn13) return undefined;
    
    return `https://www.amazon.com.br/s?k=${isbn13}&tag=${this.AMAZON_AFFILIATE_TAG}`;
  }

  private toResponseDto(userWishlist: any): UserWishlistResponseDto {
    return {
      id: userWishlist.id,
      userId: userWishlist.userId,
      bookId: userWishlist.bookId,
      createdAt: userWishlist.createdAt,
      book: userWishlist.book,
      amazonUrl: this.generateAmazonUrl(userWishlist.book.isbn),
    };
  }
} 