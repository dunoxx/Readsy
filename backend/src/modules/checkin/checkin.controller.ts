import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dtos/create-checkin.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('checkins')
@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @ApiOperation({ summary: 'Listar todos os checkins' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de checkins retornada com sucesso'
  })
  @Get()
  findAll() {
    return this.checkinService.findAll();
  }

  @ApiOperation({ summary: 'Buscar checkins de um usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de checkins do usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.checkinService.findByUser(userId);
  }

  @ApiOperation({ summary: 'Buscar checkin por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkin encontrado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Checkin não encontrado'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkinService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar novo checkin' })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkin criado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Livro ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos'
  })
  @Post('user/:userId')
  create(
    @Param('userId') userId: string,
    @Body() createCheckinDto: CreateCheckinDto,
  ) {
    return this.checkinService.create(userId, createCheckinDto);
  }

  @ApiOperation({ summary: 'Remover checkin' })
  @ApiResponse({ 
    status: 204, 
    description: 'Checkin removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Checkin não encontrado'
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.checkinService.remove(id);
  }
} 