import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { UpdateBookStatusDto } from './dtos/update-book-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchBookDto } from './dtos/search-book.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: 'Listar todos os livros' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de livros retornada com sucesso'
  })
  @Get()
  findAll(@Query() query: any, @Req() req: RequestWithUser) {
    // Por padrão, retornar apenas os livros do usuário autenticado
    return this.bookService.findAll(req.user.id, query);
  }

  @ApiOperation({ summary: 'Buscar livro por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Livro encontrado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Livro não encontrado'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar novo livro' })
  @ApiResponse({ 
    status: 201, 
    description: 'Livro criado com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBookDto: CreateBookDto, @Req() req: RequestWithUser) {
    // Usar o ID do usuário autenticado
    return this.bookService.create(createBookDto, req.user.id);
  }

  @ApiOperation({ summary: 'Atualizar livro existente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Livro atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Livro não encontrado'
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @ApiOperation({ summary: 'Remover livro' })
  @ApiResponse({ 
    status: 200, 
    description: 'Livro removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Livro não encontrado'
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }

  @ApiOperation({ summary: 'Atualizar status do livro' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status do livro atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Livro não encontrado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acesso negado - usuário não é o proprietário do livro'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateBookStatusDto,
    @Req() req: RequestWithUser
  ) {
    return this.bookService.updateStatus(id, updateStatusDto, req.user.id);
  }

  @ApiOperation({ summary: 'Busca livro por título ou ISBN' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados da busca de livros', 
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          title: { type: 'string', example: 'Dom Casmurro' },
          author: { type: 'string', example: 'Machado de Assis' },
          coverImage: { type: 'string', example: 'https://covers.openlibrary.org/b/id/8739161-L.jpg' },
          isbn: { type: 'string', example: '9788574801711' },
          pages: { type: 'number', example: 256 },
          publishedDate: { type: 'string', example: '1899' },
          publisher: { type: 'string', example: 'Companhia das Letras' },
          language: { type: 'string', example: 'pt' },
          status: { type: 'string', example: 'READING' },
          createdAt: { type: 'string', format: 'date-time' },
          createdBy: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              displayName: { type: 'string' },
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Nenhum livro encontrado'
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Termo de busca (título do livro ou ISBN)',
    type: String,
    example: 'Dom Casmurro'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchBooks(@Query('query') query: string, @Req() req: RequestWithUser) {
    const results = await this.bookService.searchBooks(query, req.user.id);
    
    if (results.length === 0) {
      return { 
        message: 'Nenhum livro encontrado para o termo de busca informado', 
        results: [] 
      };
    }
    
    return { 
      message: `${results.length} livro(s) encontrado(s)`, 
      results 
    };
  }
} 