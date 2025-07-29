import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicWishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicWishlist(slug: string) {
    console.log('=== SERVICE PÚBLICO ===');
    console.log('Buscando usuário com slug:', slug);
    
    // Buscar usuário pelo slug
    const user = await this.prisma.user.findFirst({
      where: { wishlistSlug: slug },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    });

    console.log('Usuário encontrado:', user);

    if (!user) {
      console.log('Usuário não encontrado');
      return null;
    }

    console.log('Buscando wishlist do usuário:', user.id);
    
    // Buscar wishlist do usuário
    const wishlistBooks = await this.prisma.userWishlist.findMany({
      where: { userId: user.id },
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

    console.log('Livros encontrados:', wishlistBooks.length);

    const result = {
      user: {
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
      },
      books: wishlistBooks.map(item => ({
        ...item.book,
        amazonUrl: item.book.isbn ? `https://www.amazon.com.br/s?k=${item.book.isbn}&tag=dunoxx-20` : undefined,
      })),
      booksCount: wishlistBooks.length,
    };

    console.log('Resultado final:', result);
    return result;
  }
} 