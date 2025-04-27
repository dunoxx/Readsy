import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatsService } from './stats.service';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('estatísticas')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna estatísticas do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas do usuário retornadas com sucesso',
    schema: {
      example: {
        books: {
          total: 15,
          finished: 8,
        },
        checkins: {
          total: 87,
        },
        reading: {
          pagesRead: 2450,
          minutesSpent: 1560,
          hoursSpent: 26,
        },
        social: {
          posts: 12,
          reactions: 34,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUserStats(@Req() req: RequestWithUser) {
    return this.statsService.getUserStats(req.user.id);
  }
} 