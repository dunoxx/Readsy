import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
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

  @ApiOperation({ summary: 'Obter ranking global dos 100 primeiros usuários' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking global retornado com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'number' },
          userId: { type: 'string' },
          displayName: { type: 'string' },
          profilePicture: { type: 'string' },
          level: { type: 'number' },
          seasonXP: { type: 'number' },
          totalBooks: { type: 'number' },
          totalGroups: { type: 'number' },
        }
      }
    }
  })
  @Get('global')
  getGlobalRanking() {
    return this.leaderboardService.getGlobalRanking();
  }

  @ApiOperation({ summary: 'Obter ranking dos 100 primeiros usuários de um grupo específico' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking do grupo retornado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiParam({
    name: 'groupId',
    description: 'ID do grupo',
    type: 'string'
  })
  @Get('group/:groupId')
  getGroupRanking(@Param('groupId') groupId: string) {
    return this.leaderboardService.getGroupRanking(groupId);
  }

  @ApiOperation({ summary: 'Obter posição do usuário autenticado no ranking global' })
  @ApiResponse({ 
    status: 200, 
    description: 'Posição no ranking retornada com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyRanking(@Req() req: RequestWithUser) {
    return this.leaderboardService.getUserRanking(req.user.id);
  }

  @ApiOperation({ summary: 'Obter posição de um usuário específico no ranking global' })
  @ApiResponse({ 
    status: 200, 
    description: 'Posição no ranking retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    type: 'string'
  })
  @Get('user/:userId')
  getUserRanking(@Param('userId') userId: string) {
    return this.leaderboardService.getUserRanking(userId);
  }

  @ApiOperation({ summary: 'Resetar a temporada atual (somente admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Temporada resetada com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('reset-season')
  resetSeason() {
    return this.leaderboardService.resetSeason();
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