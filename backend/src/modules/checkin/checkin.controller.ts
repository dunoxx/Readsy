import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dtos/create-checkin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: 'Criar novo check-in de leitura' })
  @ApiResponse({ 
    status: 201, 
    description: 'Check-in criado com sucesso'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCheckinDto: CreateCheckinDto,
    @Req() req: RequestWithUser
  ) {
    return this.checkinService.create(req.user.id, createCheckinDto);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.checkinService.remove(id);
  }
} 