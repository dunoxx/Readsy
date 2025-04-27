import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StatsService } from './stats.service';

@ApiTags('admin')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminStatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('global')
  @ApiOperation({ summary: 'Retorna estatísticas globais da plataforma' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas globais retornadas com sucesso',
    schema: {
      example: {
        users: {
          total: 150,
        },
        groups: {
          total: 35,
        },
        books: {
          total: 780,
          byStatus: {
            READING: 325,
            FINISHED: 405,
            ABANDONED: 25,
            PLANNING: 25,
          },
        },
        checkins: {
          total: 4250,
          totalPagesRead: 127500,
          totalMinutesSpent: 85000,
          totalHoursSpent: 1416,
          avgMinutesPerCheckin: 20,
        },
        social: {
          posts: 650,
          reactions: 1230,
        },
        topActiveUsers: [
          {
            id: '44f5e270-3016-4336-9894-adccb0e589a4',
            username: 'jane_doe',
            displayName: 'Jane Doe',
            profilePicture: 'https://example.com/profiles/jane.jpg',
            checkinsCount: 120,
          },
          // ... outros usuários
        ],
        topGenres: [], // Será implementado no futuro
        topPublishers: [], // Será implementado no futuro
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido - somente admin' })
  async getGlobalStats() {
    return this.statsService.getGlobalStats();
  }
} 