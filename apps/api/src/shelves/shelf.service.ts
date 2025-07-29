import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { ShelfResponseDto } from './dto/shelf-response.dto';
import { AddBookToShelfDto } from './dto/add-book-to-shelf.dto';
import { ReorderBooksDto } from './dto/reorder-books.dto';

@Injectable()
export class ShelfService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateShelfDto): Promise<ShelfResponseDto> {
    const shelf = await this.prisma.shelf.create({
      data: {
        ...dto,
        ownerId: userId,
      },
    });
    return this.toResponseDto(shelf);
  }

  async findAll(userId: string): Promise<ShelfResponseDto[]> {
    const shelves = await this.prisma.shelf.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });
    
    // Calcular estatísticas para cada estante
    const shelvesWithStats = await Promise.all(
      shelves.map(async (shelf) => {
        const booksCount = await this.prisma.bookOnShelf.count({
          where: { shelfId: shelf.id }
        });
        
        const readBooksCount = await this.prisma.bookOnShelf.count({
          where: { 
            shelfId: shelf.id,
            read: true
          }
        });
        
        const readingProgress = booksCount > 0 ? Math.round((readBooksCount / booksCount) * 100) : 0;
        
        return {
          ...shelf,
          booksCount,
          readingProgress
        };
      })
    );
    
    return shelvesWithStats.map(this.toResponseDto);
  }

  async findPublicByUser(userId: string): Promise<ShelfResponseDto[]> {
    const shelves = await this.prisma.shelf.findMany({
      where: { ownerId: userId, isPublic: true },
      orderBy: { createdAt: 'asc' },
    });
    
    // Calcular estatísticas para cada estante
    const shelvesWithStats = await Promise.all(
      shelves.map(async (shelf) => {
        const booksCount = await this.prisma.bookOnShelf.count({
          where: { shelfId: shelf.id }
        });
        
        const readBooksCount = await this.prisma.bookOnShelf.count({
          where: { 
            shelfId: shelf.id,
            read: true
          }
        });
        
        const readingProgress = booksCount > 0 ? Math.round((readBooksCount / booksCount) * 100) : 0;
        
        return {
          ...shelf,
          booksCount,
          readingProgress
        };
      })
    );
    
    return shelvesWithStats.map(this.toResponseDto);
  }

  // Método para obter a estante Wishlist do usuário
  async getWishlistShelf(userId: string) {
    // Wishlist é uma estante virtual que usa a tabela UserWishlist
    const wishlistBooks = await this.prisma.userWishlist.findMany({
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

    return {
      id: 'wishlist',
      name: 'Wishlist',
      emoji: '🧾',
      isWishlist: true,
      isFavorites: false,
      isPublic: true,
      booksCount: wishlistBooks.length,
      readingProgress: 0, // Wishlist não tem progresso de leitura
      books: wishlistBooks.map(item => ({
        ...item.book,
        read: false, // Livros na wishlist não são lidos
        userRating: null, // Wishlist não tem rating
        amazonUrl: item.book.isbn ? `https://www.amazon.com.br/s?k=${item.book.isbn}&tag=dunoxx-20` : undefined,
      })),
    };
  }

  // Método para obter a estante Favoritos do usuário
  async getFavoritesShelf(userId: string) {
    // Favoritos é uma estante virtual que usa a tabela UserFavorite
    const favoriteBooks = await this.prisma.userFavorite.findMany({
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

    const readCount = favoriteBooks.filter(item => item.read).length;
    const readingProgress = favoriteBooks.length > 0 ? (readCount / favoriteBooks.length) * 100 : 0;

    return {
      id: 'favorites',
      name: 'Favoritos',
      emoji: '❤️',
      isWishlist: false,
      isFavorites: true,
      isPublic: true,
      booksCount: favoriteBooks.length,
      readingProgress: Math.round(readingProgress),
      books: favoriteBooks.map(item => ({
        ...item.book,
        read: item.read,
        userRating: item.rating,
      })),
    };
  }

  // Método para obter uma estante específica (incluindo fixas)
  async findOne(id: string, userId: string) {
    if (id === 'wishlist') {
      return this.getWishlistShelf(userId);
    }

    if (id === 'favorites') {
      return this.getFavoritesShelf(userId);
    }

    // Para estantes normais
    const shelf = await this.prisma.shelf.findFirst({
      where: { id, ownerId: userId },
      include: {
        booksOnShelf: {
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
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!shelf) {
      throw new NotFoundException('Estante não encontrada');
    }

    const booksCount = shelf.booksOnShelf.length;
    const readCount = shelf.booksOnShelf.filter(item => item.read).length;
    const readingProgress = booksCount > 0 ? (readCount / booksCount) * 100 : 0;

    return {
      ...shelf,
      booksCount,
      readingProgress: Math.round(readingProgress),
      books: shelf.booksOnShelf.map(item => ({
        ...item.book,
        read: item.read,
        userRating: item.rating,
      })),
    };
  }

  async update(id: string, userId: string, dto: UpdateShelfDto): Promise<ShelfResponseDto> {
    const shelf = await this.prisma.shelf.findUnique({ where: { id } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    const updated = await this.prisma.shelf.update({ where: { id }, data: dto });
    return this.toResponseDto(updated);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const shelf = await this.prisma.shelf.findUnique({ where: { id } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    await this.prisma.shelf.delete({ where: { id } });
    return { message: 'Estante removida com sucesso' };
  }

  async addBookToShelf(shelfId: string, userId: string, dto: AddBookToShelfDto) {
    const shelf = await this.prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    // Verifica se o livro já está na estante
    const exists = await this.prisma.bookOnShelf.findUnique({ where: { shelfId_bookId: { shelfId, bookId: dto.bookId } } });
    if (exists) throw new BadRequestException('Livro já está na estante');
    // Descobre a ordem máxima atual
    const maxOrder = await this.prisma.bookOnShelf.aggregate({ where: { shelfId }, _max: { order: true } });
    return this.prisma.bookOnShelf.create({
      data: {
        shelfId,
        bookId: dto.bookId,
        order: (maxOrder._max.order ?? 0) + 1,
        read: dto.read ?? false,
        rating: dto.rating ?? null,
      } as any,
    });
  }

  async removeBookFromShelf(shelfId: string, userId: string, bookId: string) {
    const shelf = await this.prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    await this.prisma.bookOnShelf.delete({ where: { shelfId_bookId: { shelfId, bookId } } });
    return { message: 'Livro removido da estante' };
  }

  async reorderBooks(shelfId: string, userId: string, dto: ReorderBooksDto) {
    const shelf = await this.prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    // Atualiza a ordem dos livros conforme o array recebido
    await Promise.all(dto.bookIds.map((bookId, idx) =>
      this.prisma.bookOnShelf.update({
        where: { shelfId_bookId: { shelfId, bookId } },
        data: { order: idx + 1 },
      })
    ));
    return { message: 'Ordem dos livros atualizada' };
  }

  async updateBookOnShelf(shelfId: string, bookId: string, userId: string, dto: any) {
    const shelf = await this.prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    
    const bookOnShelf = await this.prisma.bookOnShelf.findUnique({ 
      where: { shelfId_bookId: { shelfId, bookId } } 
    });
    if (!bookOnShelf) throw new NotFoundException('Livro não encontrado na estante');
    
    const updateData: any = {};
    if (dto.read !== undefined) updateData.read = dto.read;
    if (dto.rating !== undefined) updateData.rating = dto.rating;
    
    return this.prisma.bookOnShelf.update({
      where: { shelfId_bookId: { shelfId, bookId } },
      data: updateData,
    });
  }

  async getBooksFromShelf(shelfId: string, userId: string) {
    const shelf = await this.prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) throw new NotFoundException('Estante não encontrada');
    if (shelf.ownerId !== userId) throw new BadRequestException('Acesso negado');
    const booksOnShelf = await this.prisma.bookOnShelf.findMany({
      where: { shelfId },
      orderBy: { order: 'asc' },
      include: { book: true },
    });
    // Retorna apenas os dados relevantes do livro + dados extras do relacionamento
    return booksOnShelf.map(bos => ({
      id: bos.book.id,
      title: bos.book.title,
      author: bos.book.author,
      isbn: bos.book.isbn,
      category: bos.book.category,
      coverUrl: bos.book.coverUrl,
      totalPages: bos.book.totalPages,
      rating: bos.book.rating,
      addedAt: bos.addedAt,
      order: bos.order,
      bookOnShelfId: bos.id,
      read: (bos as any).read,
      userRating: (bos as any).rating,
    }));
  }

  private toResponseDto(shelf: any): ShelfResponseDto {
    const { id, name, emoji, color, isWishlist, isPublic, ownerId, createdAt, booksCount, readingProgress } = shelf;
    return { id, name, emoji, color, isWishlist, isPublic, ownerId, createdAt, booksCount, readingProgress };
  }
} 