import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { CreateDailyQuestDto } from './dto/create-daily-quest.dto';
import { CreateWeeklyQuestDto } from './dto/create-weekly-quest.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('quests')
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  // Endpoints para quests diárias

  @ApiOperation({ summary: 'Obter quests diárias do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de quests diárias retornada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('daily')
  getDailyQuests(@Req() req: RequestWithUser) {
    return this.questsService.getUserDailyQuests(req.user.id);
  }

  @ApiOperation({ summary: 'Marcar quest diária como concluída' })
  @ApiResponse({
    status: 200,
    description: 'Quest diária concluída com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Quest não encontrada ou já concluída',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('daily/:questId/complete')
  completeDailyQuest(
    @Param('questId') questId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.questsService.completeDailyQuest(questId, req.user.id);
  }

  @ApiOperation({ summary: 'Re-sortear as quests diárias (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Quests diárias re-sorteadas com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('daily/refresh')
  refreshDailyQuests() {
    return this.questsService.refreshDailyQuestsForAllUsers();
  }

  @ApiOperation({ summary: 'Criar quest diária (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Quest diária criada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('daily/create')
  createDailyQuest(@Body() createDailyQuestDto: CreateDailyQuestDto) {
    return this.questsService.createDailyQuest(createDailyQuestDto);
  }

  // Endpoints para quests semanais

  @ApiOperation({ summary: 'Obter quests semanais do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de quests semanais retornada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('weekly')
  getWeeklyQuests(@Req() req: RequestWithUser) {
    return this.questsService.getUserWeeklyQuests(req.user.id);
  }

  @ApiOperation({ summary: 'Marcar quest semanal como concluída' })
  @ApiResponse({
    status: 200,
    description: 'Quest semanal concluída com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Quest não encontrada ou já concluída',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('weekly/:questId/complete')
  completeWeeklyQuest(
    @Param('questId') questId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.questsService.completeWeeklyQuest(questId, req.user.id);
  }

  @ApiOperation({ summary: 'Re-sortear as quests semanais (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Quests semanais re-sorteadas com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('weekly/refresh')
  refreshWeeklyQuests() {
    return this.questsService.refreshWeeklyQuestsForAllUsers();
  }

  @ApiOperation({ summary: 'Criar quest semanal (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Quest semanal criada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('weekly/create')
  createWeeklyQuest(@Body() createWeeklyQuestDto: CreateWeeklyQuestDto) {
    return this.questsService.createWeeklyQuest(createWeeklyQuestDto);
  }
} 