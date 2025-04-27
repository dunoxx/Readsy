import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { AdminSettingsService } from './admin-settings.service';
import { I18nService } from './i18n.service';
import { DashboardService } from './dashboard.service';
import { AdminGuard } from './guards/admin.guard';
import { UpdateUserDto } from '../user/dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminLogService: AdminLogService,
    private readonly adminSettingsService: AdminSettingsService,
    private readonly i18nService: I18nService,
    private readonly dashboardService: DashboardService,
  ) {}

  /**
   * Dashboard e Analytics
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas para o dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas do dashboard retornadas com sucesso' })
  async getDashboard() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('dashboard/users-growth')
  @ApiOperation({ summary: 'Obter gráfico de crescimento de usuários' })
  @ApiResponse({ status: 200, description: 'Dados do gráfico retornados com sucesso' })
  async getUsersGrowthChart() {
    return this.dashboardService.getUsersGrowthChart();
  }

  @Get('dashboard/checkins-activity')
  @ApiOperation({ summary: 'Obter gráfico de atividade de check-ins' })
  @ApiResponse({ status: 200, description: 'Dados do gráfico retornados com sucesso' })
  async getCheckinsActivityChart() {
    return this.dashboardService.getCheckinsActivityChart();
  }

  /**
   * Gerenciamento de Usuários
   */
  @Get('users')
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  @ApiQuery({ name: 'search', required: false, description: 'Termo de busca (email, username, id)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filtrar por papel (ADMIN, MEMBER)' })
  @ApiQuery({ name: 'page', required: false, description: 'Página atual', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página', type: Number })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenação' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Ordem (asc, desc)' })
  async findAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.adminService.findAllUsers({ search, role, page, limit, sortBy, sortOrder });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findUser(@Param('id') id: string) {
    return this.adminService.findUser(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.updateUser(id, updateUserDto, req.user.id);
  }

  @Post('users/:id/block')
  @ApiOperation({ summary: 'Bloquear usuário' })
  @ApiResponse({ status: 200, description: 'Usuário bloqueado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async blockUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.adminService.toggleUserSuspension(id, true, req.user.id);
  }

  @Post('users/:id/unblock')
  @ApiOperation({ summary: 'Desbloquear usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desbloqueado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async unblockUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.adminService.toggleUserSuspension(id, false, req.user.id);
  }

  @Post('users/:id/promote')
  @ApiOperation({ summary: 'Promover usuário a administrador' })
  @ApiResponse({ status: 200, description: 'Usuário promovido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async promoteUser(
    @Param('id') id: string,
    @Body('adminPassword') adminPassword: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.changeUserRole(id, 'ADMIN', req.user.id, adminPassword);
  }

  @Post('users/:id/demote')
  @ApiOperation({ summary: 'Remover privilégios de administrador do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário demovido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async demoteUser(
    @Param('id') id: string,
    @Body('adminPassword') adminPassword: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.changeUserRole(id, 'MEMBER', req.user.id, adminPassword);
  }

  /**
   * Gerenciamento de Grupos
   */
  @Get('groups')
  @ApiOperation({ summary: 'Listar grupos' })
  @ApiResponse({ status: 200, description: 'Lista de grupos retornada com sucesso' })
  @ApiQuery({ name: 'search', required: false, description: 'Termo de busca (nome, descrição, id)' })
  @ApiQuery({ name: 'isPublic', required: false, description: 'Filtrar por visibilidade', type: Boolean })
  @ApiQuery({ name: 'page', required: false, description: 'Página atual', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página', type: Number })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenação' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Ordem (asc, desc)' })
  async findAllGroups(
    @Query('search') search?: string,
    @Query('isPublic') isPublic?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.adminService.findAllGroups({ 
      search, 
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined, 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    });
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'Atualizar grupo' })
  @ApiResponse({ status: 200, description: 'Grupo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: { name?: string; description?: string; isPublic?: boolean },
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.updateGroup(id, updateGroupDto, req.user.id);
  }

  @Post('groups/:id/transfer')
  @ApiOperation({ summary: 'Transferir propriedade de um grupo' })
  @ApiResponse({ status: 200, description: 'Propriedade transferida com sucesso' })
  @ApiResponse({ status: 404, description: 'Grupo ou usuário não encontrado' })
  @HttpCode(HttpStatus.OK)
  async transferGroupOwnership(
    @Param('id') id: string,
    @Body('newOwnerId') newOwnerId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.transferGroupOwnership(id, newOwnerId, req.user.id);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Excluir grupo' })
  @ApiResponse({ status: 200, description: 'Grupo excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  async deleteGroup(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.adminService.deleteGroup(id, req.user.id);
  }

  /**
   * Gerenciamento de Logs
   */
  @Get('logs')
  @ApiOperation({ summary: 'Listar logs de administração' })
  @ApiResponse({ status: 200, description: 'Lista de logs retornada com sucesso' })
  @ApiQuery({ name: 'adminId', required: false, description: 'ID do administrador' })
  @ApiQuery({ name: 'action', required: false, description: 'Tipo de ação' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Tipo de entidade' })
  @ApiQuery({ name: 'entityId', required: false, description: 'ID da entidade' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Página atual', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página', type: Number })
  async findLogs(
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminLogService.findLogs({
      adminId,
      action,
      entityType,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    });
  }

  /**
   * Gerenciamento de Configurações
   */
  @Get('settings')
  @ApiOperation({ summary: 'Listar configurações do sistema' })
  @ApiResponse({ status: 200, description: 'Configurações retornadas com sucesso' })
  @ApiQuery({ name: 'category', required: false, description: 'Categoria de configurações' })
  async getSettings(@Query('category') category?: string) {
    return this.adminSettingsService.findAll(category);
  }

  @Patch('settings/:key')
  @ApiOperation({ summary: 'Atualizar uma configuração' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso' })
  async updateSetting(
    @Param('key') key: string,
    @Body() data: { value: any; description?: string; category?: string },
    @Req() req: RequestWithUser,
  ) {
    const result = await this.adminSettingsService.upsert(
      key,
      data.value,
      data.description,
      data.category
    );
    
    await this.adminLogService.log(
      req.user.id,
      'UPDATE_SETTING',
      'setting',
      key,
      { value: data.value, category: data.category }
    );
    
    return result;
  }

  @Post('settings/initialize')
  @ApiOperation({ summary: 'Inicializar configurações padrão' })
  @ApiResponse({ status: 200, description: 'Configurações inicializadas com sucesso' })
  @HttpCode(HttpStatus.OK)
  async initializeSettings(@Req() req: RequestWithUser) {
    const result = await this.adminSettingsService.initializeDefaultSettings();
    
    await this.adminLogService.log(
      req.user.id,
      'INITIALIZE_SETTINGS',
      'settings',
      null,
      { message: 'Configurações padrão inicializadas' }
    );
    
    return result;
  }

  /**
   * Gerenciamento de Idiomas
   */
  @Get('languages')
  @ApiOperation({ summary: 'Listar idiomas disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de idiomas retornada com sucesso' })
  async getLanguages() {
    return this.i18nService.getAllLanguages();
  }

  @Get('languages/:locale')
  @ApiOperation({ summary: 'Obter traduções de um idioma' })
  @ApiResponse({ status: 200, description: 'Traduções retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Idioma não encontrado' })
  async getLanguage(@Param('locale') locale: string) {
    return this.i18nService.getLanguageTranslations(locale);
  }

  @Post('languages/:locale')
  @ApiOperation({ summary: 'Criar ou atualizar um idioma' })
  @ApiResponse({ status: 200, description: 'Idioma atualizado com sucesso' })
  @HttpCode(HttpStatus.OK)
  async updateLanguage(
    @Param('locale') locale: string,
    @Body() data: Record<string, any>,
    @Req() req: RequestWithUser,
  ) {
    const result = await this.i18nService.upsertLanguage(locale, data);
    
    await this.adminLogService.log(
      req.user.id,
      'UPDATE_LANGUAGE',
      'language',
      locale,
      { locale }
    );
    
    return result;
  }

  @Delete('languages/:locale')
  @ApiOperation({ summary: 'Remover um idioma' })
  @ApiResponse({ status: 200, description: 'Idioma removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Idioma não encontrado' })
  async removeLanguage(@Param('locale') locale: string, @Req() req: RequestWithUser) {
    const result = await this.i18nService.removeLanguage(locale);
    
    await this.adminLogService.log(
      req.user.id,
      'DELETE_LANGUAGE',
      'language',
      locale,
      { locale }
    );
    
    return result;
  }

  @Post('languages/:locale/import')
  @ApiOperation({ summary: 'Importar arquivo de tradução' })
  @ApiResponse({ status: 200, description: 'Arquivo importado com sucesso' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async importLanguage(
    @Param('locale') locale: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const content = file.buffer.toString('utf-8');
    const result = await this.i18nService.importLanguage(locale, content);
    
    await this.adminLogService.log(
      req.user.id,
      'IMPORT_LANGUAGE',
      'language',
      locale,
      { locale, fileSize: file.size }
    );
    
    return result;
  }

  @Get('languages/:locale/export')
  @ApiOperation({ summary: 'Exportar arquivo de tradução' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado com sucesso' })
  @ApiResponse({ status: 404, description: 'Idioma não encontrado' })
  async exportLanguage(@Param('locale') locale: string) {
    return this.i18nService.exportLanguage(locale);
  }

  @Post('languages/initialize')
  @ApiOperation({ summary: 'Inicializar idioma padrão (pt)' })
  @ApiResponse({ status: 200, description: 'Idioma padrão inicializado com sucesso' })
  @HttpCode(HttpStatus.OK)
  async initializeDefaultLanguage(@Req() req: RequestWithUser) {
    const result = await this.i18nService.initializeDefaultLanguage();
    
    await this.adminLogService.log(
      req.user.id,
      'INITIALIZE_DEFAULT_LANGUAGE',
      'language',
      'pt',
      { locale: 'pt' }
    );
    
    return result;
  }
} 