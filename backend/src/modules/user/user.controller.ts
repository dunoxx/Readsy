import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários retornada com sucesso'
  })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário encontrado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email ou username já em uso'
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Atualizar usuário existente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email ou username já em uso'
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ 
    status: 204, 
    description: 'Usuário removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
} 