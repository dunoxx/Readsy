import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @ApiOperation({ summary: 'Obter ranking global' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking retornado com sucesso'
  })
  @ApiQuery({
    name: 'season',
    required: false,
    description: 'Temporada do ranking (ex: 2023-Q2)'
  })
  @Get()
  getGlobalRanking(@Param('season') season?: string) {
    return this.leaderboardService.getGlobalRanking(season);
  }

  @ApiOperation({ summary: 'Obter ranking de um usuário específico' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking do usuário retornado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiQuery({
    name: 'season',
    required: false,
    description: 'Temporada do ranking (ex: 2023-Q2)'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getUserRanking(
    @Param('userId') userId: string,
    @Param('season') season?: string
  ) {
    return this.leaderboardService.getUserRanking(userId, season);
  }

  @ApiOperation({ summary: 'Obter ranking do usuário autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking do usuário retornado com sucesso'
  })
  @ApiQuery({
    name: 'season',
    required: false,
    description: 'Temporada do ranking (ex: 2023-Q2)'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyRanking(@Req() req: RequestWithUser, @Param('season') season?: string) {
    return this.leaderboardService.getUserRanking(req.user.id, season);
  }

  @ApiOperation({ summary: 'Adicionar pontos para um usuário (apenas para uso interno/testes)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pontos adicionados com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiQuery({
    name: 'season',
    required: false,
    description: 'Temporada do ranking (ex: 2023-Q2)'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('add-points/:userId')
  addPoints(
    @Param('userId') userId: string,
    @Body('points') points: number,
    @Param('season') season?: string
  ) {
    return this.leaderboardService.addPoints(userId, points, season);
  }
} 