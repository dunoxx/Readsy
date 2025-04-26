import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @ApiOperation({ summary: 'Obter todas as conquistas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de conquistas retornada com sucesso',
  })
  @Get()
  getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  @ApiOperation({ summary: 'Obter conquistas do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de conquistas do usuário retornada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getUserAchievements(@Req() req: RequestWithUser) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @ApiOperation({ summary: 'Obter conquistas de um usuário específico' })
  @ApiResponse({
    status: 200,
    description: 'Lista de conquistas do usuário retornada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('user/:userId')
  getAchievementsByUserId(@Param('userId') userId: string) {
    return this.achievementsService.getUserAchievements(userId);
  }

  @ApiOperation({ summary: 'Criar nova conquista (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Conquista criada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create')
  createAchievement(@Body() createAchievementDto: CreateAchievementDto) {
    return this.achievementsService.createAchievement(createAchievementDto);
  }

  @ApiOperation({ summary: 'Atualizar progresso em uma conquista específica' })
  @ApiResponse({
    status: 200,
    description: 'Progresso atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou conquista não encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('user/:userId/achievement/:achievementId/progress/:value')
  updateAchievementProgress(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
    @Param('value') value: number,
  ) {
    return this.achievementsService.updateAchievementProgress(userId, achievementId, +value);
  }

  @ApiOperation({ summary: 'Atribuir conquistas a todos os usuários (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Conquistas atribuídas com sucesso a todos os usuários',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign-all')
  assignAchievementsToAllUsers() {
    return this.achievementsService.assignAchievementsToAllUsers();
  }

  @ApiOperation({ summary: 'Atribuir conquistas a um usuário específico (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Conquistas atribuídas com sucesso ao usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('assign/:userId')
  assignAchievementsToUser(@Param('userId') userId: string) {
    return this.achievementsService.assignAchievementsToUser(userId);
  }
} 