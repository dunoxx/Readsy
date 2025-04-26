import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { JoinChallengeDto } from './dtos/join-challenge.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('challenges')
@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @ApiOperation({ summary: 'Listar todos os desafios' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de desafios retornada com sucesso'
  })
  @Get()
  findAll() {
    return this.challengeService.findAll();
  }

  @ApiOperation({ summary: 'Listar desafios públicos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de desafios públicos retornada com sucesso'
  })
  @Get('public')
  findPublic() {
    return this.challengeService.findPublic();
  }

  @ApiOperation({ summary: 'Buscar desafios criados por um usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de desafios do usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('created-by/:userId')
  findByCreator(@Param('userId') userId: string) {
    return this.challengeService.findByCreator(userId);
  }

  @ApiOperation({ summary: 'Buscar desafios em que um usuário participa' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de participações do usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('participated-by/:userId')
  findByParticipant(@Param('userId') userId: string) {
    return this.challengeService.findByParticipant(userId);
  }

  @ApiOperation({ summary: 'Buscar desafio por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Desafio encontrado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Desafio não encontrado'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challengeService.findOne(id);
  }

  @ApiOperation({ summary: 'Criar novo desafio' })
  @ApiResponse({ 
    status: 201, 
    description: 'Desafio criado com sucesso'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createChallengeDto: CreateChallengeDto, @Req() req: RequestWithUser) {
    return this.challengeService.create(createChallengeDto, req.user.id);
  }

  @ApiOperation({ summary: 'Atualizar desafio existente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Desafio atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Desafio não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o criador pode atualizar o desafio'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @Req() req: RequestWithUser
  ) {
    return this.challengeService.update(id, updateChallengeDto, req.user.id);
  }

  @ApiOperation({ summary: 'Remover desafio' })
  @ApiResponse({ 
    status: 204, 
    description: 'Desafio removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Desafio não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o criador pode remover o desafio'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.challengeService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Participar de um desafio' })
  @ApiResponse({ 
    status: 201, 
    description: 'Participação criada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Desafio ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário já participa deste desafio'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':challengeId/join')
  joinChallenge(@Param('challengeId') challengeId: string, @Req() req: RequestWithUser) {
    return this.challengeService.joinChallenge(challengeId, req.user.id);
  }

  @ApiOperation({ summary: 'Sair de um desafio' })
  @ApiResponse({ 
    status: 200, 
    description: 'Participação removida com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Desafio ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não participa deste desafio'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':challengeId/leave')
  leaveChallenge(@Param('challengeId') challengeId: string, @Req() req: RequestWithUser) {
    return this.challengeService.leaveChallenge(challengeId, req.user.id);
  }

  @ApiOperation({ summary: 'Atualizar progresso em um desafio' })
  @ApiResponse({ 
    status: 200, 
    description: 'Progresso atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Desafio ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não participa deste desafio ou progresso inválido'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':challengeId/progress')
  updateProgress(
    @Param('challengeId') challengeId: string,
    @Body('progress') progress: number,
    @Req() req: RequestWithUser
  ) {
    return this.challengeService.updateProgress(challengeId, req.user.id, progress);
  }
} 