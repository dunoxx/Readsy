import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { UpdateBookStatusDto } from './dtos/update-book-status.dto';
import { ExternalBookService } from './services/external-book.service';

@Injectable()
export class BookService {
  constructor(
    private prisma: PrismaService,
    private externalBookService: ExternalBookService
  ) {}

  // Listar todos os livros
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
    // Verificar se já existe um livro com esse ISBN, se fornecido
    if (createBookDto.isbn) {
      const existingBook = await this.prisma.book.findFirst({
        where: { isbn: createBookDto.isbn },
      });

      if (existingBook) {
        throw new ConflictException(`Já existe um livro cadastrado com o ISBN ${createBookDto.isbn}`);
      }
    }

    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        coverImage: createBookDto.coverImage,
        isbn: createBookDto.isbn,
        pages: createBookDto.pages,
        publishedDate: createBookDto.publishedDate,
        description: createBookDto.description,
        publisher: createBookDto.publisher,
        language: createBookDto.language,
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
        publishedDate: updateBookDto.publishedDate,
        description: updateBookDto.description,
        publisher: updateBookDto.publisher,
        language: updateBookDto.language,
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

  // Remover livro
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

    return { message: `Livro removido com sucesso` };
  }

  // Atualizar status do livro
  async updateStatus(id: string, dto: UpdateBookStatusDto, user: any) {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o proprietário do livro
    if (book.createdBy.id !== user.id) {
      throw new ForbiddenException(`Acesso negado: apenas o proprietário pode atualizar o status do livro`);
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        status: dto.status,
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

  // Buscar livros por título ou ISBN
  async searchBooks(query: string, userId: string) {
    // Primeiro, busca na base de dados local
    const localBooks = await this.searchLocalBooks(query);
    
    if (localBooks.length > 0) {
      return localBooks;
    }
    
    // Se não encontrar no banco local, busca na API do OpenLibrary
    let externalBook = null;
    
    // Se o query parece ser um ISBN (apenas números e hífens)
    const isIsbn = /^[\d-]+$/.test(query);
    
    if (isIsbn) {
      externalBook = await this.externalBookService.searchOpenLibraryByIsbn(query);
    } else {
      externalBook = await this.externalBookService.searchOpenLibraryByTitle(query);
    }
    
    // Se encontrou na OpenLibrary, salva no banco e retorna
    if (externalBook) {
      const savedBook = await this.create(externalBook, userId);
      return [savedBook];
    }
    
    // Se não encontrou na OpenLibrary, busca no Google Books
    externalBook = await this.externalBookService.searchGoogleBooks(query);
    
    // Se encontrou no Google Books, salva no banco e retorna
    if (externalBook) {
      const savedBook = await this.create(externalBook, userId);
      return [savedBook];
    }
    
    // Se não encontrou em nenhuma fonte, retorna array vazio
    return [];
  }
  
  // Buscar livros localmente (no banco de dados)
  private async searchLocalBooks(query: string) {
    const isIsbn = /^[\d-]+$/.test(query);
    
    if (isIsbn) {
      // Busca por ISBN
      const bookByIsbn = await this.prisma.book.findFirst({
        where: {
          isbn: {
            equals: query,
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
      
      return bookByIsbn ? [bookByIsbn] : [];
    } else {
      // Busca por título (case insensitive e parcial)
      return this.prisma.book.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              author: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
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
        take: 5, // Limitar a 5 resultados
      });
    }
  }
  
  // Função para uso futuro - atualizar livros incompletos
  async updateIncompleteBooks() {
    // Busca livros com campos importantes nulos
    const incompleteBooks = await this.prisma.book.findMany({
      where: {
        OR: [
          { pages: null },
          { publishedDate: null },
          { description: null },
          { publisher: null },
          { language: null },
        ],
      },
    });
    
    const updatedCount = {
      success: 0,
      failed: 0,
    };
    
    // Para cada livro incompleto, tenta completar as informações
    for (const book of incompleteBooks) {
      try {
        let updatedBookData = null;
        
        // Se tiver ISBN, tenta buscar por ISBN
        if (book.isbn) {
          updatedBookData = await this.externalBookService.searchOpenLibraryByIsbn(book.isbn);
          
          if (!updatedBookData) {
            updatedBookData = await this.externalBookService.searchGoogleBooks(book.isbn);
          }
        }
        
        // Se não achou por ISBN, tenta buscar pelo título
        if (!updatedBookData) {
          updatedBookData = await this.externalBookService.searchOpenLibraryByTitle(book.title);
          
          if (!updatedBookData) {
            updatedBookData = await this.externalBookService.searchGoogleBooks(book.title);
          }
        }
        
        // Se encontrou dados atualizados, atualiza o livro
        if (updatedBookData) {
          await this.prisma.book.update({
            where: { id: book.id },
            data: {
              pages: updatedBookData.pages ?? book.pages,
              publishedDate: updatedBookData.publishedDate ?? undefined,
              description: updatedBookData.description ?? undefined,
              publisher: updatedBookData.publisher ?? undefined,
              language: updatedBookData.language ?? undefined,
            },
          });
          
          updatedCount.success++;
        } else {
          updatedCount.failed++;
        }
      } catch (error) {
        updatedCount.failed++;
        console.error(`Erro ao atualizar livro ${book.id}: ${error.message}`);
      }
    }
    
    return {
      message: `Atualização de livros incompletos concluída`,
      processed: incompleteBooks.length,
      updated: updatedCount.success,
      failed: updatedCount.failed,
    };
  }
} 