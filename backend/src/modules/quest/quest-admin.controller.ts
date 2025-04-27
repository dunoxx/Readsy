import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dtos/create-quest.dto';
import { AdminGuard } from '../admin/guards/admin.guard';
import { AdminLogService } from '../admin/admin-log.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Admin - Quests')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('api/admin/quests')
export class QuestAdminController {
  constructor(
    private readonly questService: QuestService,
    private readonly adminLogService: AdminLogService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as quests globais' })
  @ApiResponse({ status: 200, description: 'Lista de quests retornada com sucesso' })
  @ApiQuery({ name: 'isDaily', required: false, description: 'Filtrar quests diárias ou semanais', type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filtrar quests ativas ou inativas', type: Boolean })
  async findAll(
    @Query('isDaily') isDaily?: boolean,
    @Query('isActive') isActive?: boolean,
  ) {
    if (isDaily === true) {
      return this.questService.findAllDaily();
    } else if (isDaily === false) {
      return this.questService.findAllWeekly();
    }
    
    return this.questService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar quest global por ID' })
  @ApiResponse({ status: 200, description: 'Quest encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Quest não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.questService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova quest global' })
  @ApiResponse({ status: 201, description: 'Quest criada com sucesso' })
  async create(@Body() createQuestDto: CreateQuestDto, @Req() req: RequestWithUser) {
    const quest = await this.questService.create(createQuestDto);
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      req.user.id,
      'CREATE_QUEST',
      'quest',
      quest.id,
      { questType: quest.type, isDaily: quest.isDaily }
    );
    
    return quest;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar quest global' })
  @ApiResponse({ status: 200, description: 'Quest atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Quest não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateQuestDto: Partial<CreateQuestDto>,
    @Req() req: RequestWithUser,
  ) {
    const quest = await this.questService.update(id, updateQuestDto);
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      req.user.id,
      'UPDATE_QUEST',
      'quest',
      id,
      { updatedFields: Object.keys(updateQuestDto) }
    );
    
    return quest;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover quest global' })
  @ApiResponse({ status: 200, description: 'Quest removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Quest não encontrada' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const quest = await this.questService.findOne(id);
    const result = await this.questService.remove(id);
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      req.user.id,
      'DELETE_QUEST',
      'quest',
      id,
      { questType: quest.type, isDaily: quest.isDaily }
    );
    
    return result;
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Ativar uma quest' })
  @ApiResponse({ status: 200, description: 'Quest ativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Quest não encontrada' })
  async activate(@Param('id') id: string, @Req() req: RequestWithUser) {
    const quest = await this.questService.activate(id);
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      req.user.id,
      'ACTIVATE_QUEST',
      'quest',
      id,
      { questType: quest.type, isDaily: quest.isDaily }
    );
    
    return quest;
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Desativar uma quest' })
  @ApiResponse({ status: 200, description: 'Quest desativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Quest não encontrada' })
  async deactivate(@Param('id') id: string, @Req() req: RequestWithUser) {
    const quest = await this.questService.deactivate(id);
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      req.user.id,
      'DEACTIVATE_QUEST',
      'quest',
      id,
      { questType: quest.type, isDaily: quest.isDaily }
    );
    
    return quest;
  }
} 