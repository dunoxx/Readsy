import { Controller, Get, Post, UseGuards, Req, Param } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @ApiOperation({ summary: 'Obter status de gamificação do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Status de gamificação retornado com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('status')
  getUserStatus(@Req() req: RequestWithUser) {
    return this.gamificationService.getUserStatus(req.user.id);
  }

  @ApiOperation({ summary: 'Obter status de gamificação de um usuário específico (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Status de gamificação retornado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('status/:userId')
  getUserStatusById(@Param('userId') userId: string) {
    return this.gamificationService.getUserStatus(userId);
  }

  @ApiOperation({ summary: 'Adicionar XP a um usuário (admin)' })
  @ApiResponse({
    status: 200,
    description: 'XP adicionado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('xp/:userId/:amount')
  addXp(
    @Param('userId') userId: string,
    @Param('amount') amount: string,
  ) {
    return this.gamificationService.addXp(userId, +amount);
  }

  @ApiOperation({ summary: 'Obter tabela de recompensas por nível' })
  @ApiResponse({
    status: 200,
    description: 'Tabela de recompensas retornada com sucesso',
  })
  @Get('level-rewards')
  getLevelRewards() {
    return this.gamificationService.getLevelRewards();
  }

  @ApiOperation({ summary: 'Resetar temporada e distribuir recompensas (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Temporada resetada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('reset-season')
  resetSeason() {
    return this.gamificationService.resetSeason();
  }
} 