import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CreateBookDto } from '../dtos/create-book.dto';

@Injectable()
export class ExternalBookService {
  private readonly logger = new Logger(ExternalBookService.name);
  private readonly openLibraryUrl = 'https://openlibrary.org/api/books';
  private readonly openLibrarySearchUrl = 'https://openlibrary.org/search.json';
  private readonly googleBooksUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly placeholderCover = 'https://readsy.app/placeholder-cover.jpg';

  /**
   * Busca um livro pela API do OpenLibrary usando ISBN
   * @param isbn ISBN do livro
   */
  async searchOpenLibraryByIsbn(isbn: string): Promise<CreateBookDto | null> {
    try {
      const cleanIsbn = isbn.replace(/-/g, '').trim();
      const response = await axios.get(`${this.openLibraryUrl}?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      
      if (response.data && response.data[`ISBN:${cleanIsbn}`]) {
        const book = response.data[`ISBN:${cleanIsbn}`];
        
        // Extrair informações do livro
        const title = book.title;
        const author = book.authors?.[0]?.name || 'Autor Desconhecido';
        const coverImage = book.cover?.large || book.cover?.medium || book.cover?.small || this.placeholderCover;
        const pages = book.number_of_pages || undefined;
        const publishedDate = book.publish_date ? String(new Date(book.publish_date).getFullYear()) : undefined;
        const publisher = book.publishers?.[0]?.name || undefined;
        const language = book.languages?.[0]?.key?.replace('/languages/', '') || undefined;
        
        return {
          title,
          author,
          coverImage,
          isbn: cleanIsbn,
          pages,
          publishedDate,
          publisher,
          language,
        };
      }
      
      return null;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar livro na OpenLibrary via ISBN: ${error.message}`);
      return null;
    }
  }

  /**
   * Busca um livro pela API do OpenLibrary usando o título
   * @param title Título do livro
   */
  async searchOpenLibraryByTitle(title: string): Promise<CreateBookDto | null> {
    try {
      const response = await axios.get(`${this.openLibrarySearchUrl}?title=${encodeURIComponent(title)}&limit=1`);
      
      if (response.data && response.data.docs && response.data.docs.length > 0) {
        const book = response.data.docs[0];
        
        // Extrair informações do livro
        const bookTitle = book.title;
        const author = book.author_name?.[0] || 'Autor Desconhecido';
        const coverImageId = book.cover_i;
        const coverImage = coverImageId 
          ? `https://covers.openlibrary.org/b/id/${coverImageId}-L.jpg`
          : this.placeholderCover;
        const isbn = book.isbn?.[0] || undefined;
        const pages = book.number_of_pages_median || undefined;
        const publishedDate = book.first_publish_year ? String(book.first_publish_year) : undefined;
        const publisher = book.publisher?.[0] || undefined;
        const language = book.language?.[0] || undefined;
        
        return {
          title: bookTitle,
          author,
          coverImage,
          isbn,
          pages,
          publishedDate,
          publisher,
          language,
        };
      }
      
      return null;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar livro na OpenLibrary via título: ${error.message}`);
      return null;
    }
  }

  /**
   * Busca um livro pela API do Google Books usando ISBN ou título
   * @param query ISBN ou título do livro
   */
  async searchGoogleBooks(query: string): Promise<CreateBookDto | null> {
    try {
      // Verifica se o query é um ISBN (contém apenas números e hífens)
      const isIsbn = /^[\d-]+$/.test(query);
      let searchParam = isIsbn ? `isbn:${query}` : query;
      
      const response = await axios.get(`${this.googleBooksUrl}?q=${encodeURIComponent(searchParam)}&maxResults=1`);
      
      if (response.data && response.data.items && response.data.items.length > 0) {
        const book = response.data.items[0].volumeInfo;
        
        // Extrair informações do livro
        const title = book.title;
        const author = book.authors?.[0] || 'Autor Desconhecido';
        const coverImage = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || this.placeholderCover;
        // Priorizar ISBN-13, se disponível
        let isbn: string | undefined = undefined;
        if (book.industryIdentifiers) {
          const isbn13 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
          const isbn10 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
          isbn = isbn13?.identifier || isbn10?.identifier || undefined;
        }
        const pages = book.pageCount || undefined;
        const publishedDate = book.publishedDate ? String(book.publishedDate.substring(0, 4)) : undefined;
        const publisher = book.publisher || undefined;
        const language = book.language || undefined;
        const description = book.description || undefined;
        
        return {
          title,
          author,
          coverImage,
          isbn,
          pages,
          publishedDate,
          description,
          publisher,
          language,
        };
      }
      
      return null;
    } catch (error: any) {
      this.logger.error(`Erro ao buscar livro no Google Books: ${error.message}`);
      return null;
    }
  }
} 