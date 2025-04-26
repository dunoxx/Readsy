import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dtos/create-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBookDto: CreateBookDto, @Req() req) {
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
} 