import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  findAll() {
    return this.bookService.findAll();
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
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    // Temporariamente utilizando um ID fixo para o admin
    // Em uma implementação real, isso seria obtido da autenticação
    const adminId = 'admin-user-id'; 
    return this.bookService.create(createBookDto, adminId);
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
    status: 204, 
    description: 'Livro removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Livro não encontrado'
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
} 