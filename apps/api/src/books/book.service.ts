import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateBookIsbnDto } from './dto/create-book-isbn.dto';
import { SearchBookDto } from './dto/search-book.dto';
import axios from 'axios';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos de busca, cadastro, detalhes e integração com APIs externas serão implementados aqui

  async searchBooks(dto: SearchBookDto) {
    // Busca Google Books
    let results: any[] = [];
    if (dto.title || dto.author || dto.isbn) {
      const q = [
        dto.title ? `intitle:${dto.title}` : '',
        dto.author ? `inauthor:${dto.author}` : '',
        dto.isbn ? `isbn:${dto.isbn}` : '',
      ].filter(Boolean).join('+');
      const googleRes = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: { q, maxResults: 10 },
      });
      results = googleRes.data.items?.map((item: any) => ({
        source: 'google',
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(', '),
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
        coverUrl: item.volumeInfo.imageLinks?.thumbnail,
        totalPages: item.volumeInfo.pageCount,
        category: item.volumeInfo.categories?.[0],
        description: item.volumeInfo.description,
      })) || [];
    }
    // Busca OpenLibrary
    if (results.length < 10 && (dto.title || dto.author || dto.isbn)) {
      const olRes = await axios.get('https://openlibrary.org/search.json', {
        params: {
          title: dto.title,
          author: dto.author,
          isbn: dto.isbn,
          limit: 10 - results.length,
        },
      });
      const olBooks = olRes.data.docs?.map((doc: any) => ({
        source: 'openlibrary',
        id: doc.key,
        title: doc.title,
        author: doc.author_name?.join(', '),
        isbn: doc.isbn?.[0],
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
        totalPages: doc.number_of_pages_median,
        category: doc.subject?.[0],
        description: doc.first_sentence?.[0],
      })) || [];
      results = results.concat(olBooks);
    }
    return results;
  }

  async create(userId: string, dto: CreateBookDto) {
    // Verifica unicidade de ISBN se informado
    if (dto.isbn) {
      const exists = await this.prisma.book.findUnique({ where: { isbn: dto.isbn } });
      if (exists) throw new BadRequestException('Livro com este ISBN já cadastrado');
    }
    const book = await this.prisma.book.create({
      data: {
        ...dto,
        addedById: userId,
      },
    });
    return book;
  }

  async createByIsbn(userId: string, dto: CreateBookIsbnDto) {
    // Busca Google Books por ISBN
    const googleRes = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: { q: `isbn:${dto.isbn}` },
    });
    const item = googleRes.data.items?.[0];
    if (!item) throw new NotFoundException('Livro não encontrado nas APIs externas');
    // Verifica unicidade
    const exists = await this.prisma.book.findUnique({ where: { isbn: dto.isbn } });
    if (exists) throw new BadRequestException('Livro com este ISBN já cadastrado');
    const book = await this.prisma.book.create({
      data: {
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(', '),
        isbn: dto.isbn,
        coverUrl: item.volumeInfo.imageLinks?.thumbnail,
        totalPages: item.volumeInfo.pageCount || 1,
        category: item.volumeInfo.categories?.[0],
        amazonAffiliateUrl: undefined,
        addedById: userId,
      },
    });
    return book;
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Livro não encontrado');
    return book;
  }
} 