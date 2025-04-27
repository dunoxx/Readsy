import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus, 
  Query 
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { TransferOwnershipDto } from './dtos/transfer-ownership.dto';
import { InviteMemberDto } from './dtos/invite-member.dto';
import { MemberActionDto } from './dtos/member-action.dto';
import { CreateGroupChallengeDto } from './dtos/create-group-challenge.dto';
import { GroupMemberDto } from './dtos/group-member.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('groups')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({ 
    summary: 'Listar todos os grupos públicos',
    description: 'Retorna uma lista de todos os grupos públicos, opcionalmente filtrados por nome'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos retornada com sucesso'
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Termo de busca para filtrar grupos por nome'
  })
  @Get()
  findAll(@Query('query') query?: string) {
    return this.groupService.findAll(query);
  }

  @ApiOperation({ 
    summary: 'Buscar grupo por ID',
    description: 'Retorna detalhes de um grupo específico pelo seu ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Grupo encontrado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @ApiOperation({ 
    summary: 'Buscar grupos em que um usuário participa',
    description: 'Retorna uma lista de todos os grupos onde o usuário especificado é membro'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos do usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('member/:userId')
  findByMember(@Param('userId') userId: string) {
    return this.groupService.findByMember(userId);
  }

  @ApiOperation({ 
    summary: 'Buscar grupos criados por um usuário',
    description: 'Retorna uma lista de todos os grupos onde o usuário especificado é o proprietário'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos criados pelo usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID único do usuário',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('owner/:userId')
  findByOwner(@Param('userId') userId: string) {
    return this.groupService.findByOwner(userId);
  }

  @ApiOperation({ 
    summary: 'Ver membros de um grupo',
    description: 'Retorna a lista de membros de um grupo específico, incluindo seus papéis e informações básicas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de membros do grupo retornada com sucesso',
    type: [GroupMemberDto]
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @Get(':id/members')
  findMembers(@Param('id') groupId: string) {
    return this.groupService.findMembers(groupId);
  }

  @ApiOperation({ 
    summary: 'Ver ranking interno de um grupo',
    description: 'Retorna o leaderboard interno do grupo com pontuações e posições dos membros'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking do grupo retornado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @Get(':id/leaderboard')
  getLeaderboard(@Param('id') groupId: string) {
    return this.groupService.getLeaderboard(groupId);
  }

  @ApiOperation({
    summary: 'Listar desafios de um grupo',
    description: 'Retorna a lista de desafios ativos e passados de um grupo específico'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de desafios do grupo retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @Get(':id/challenges')
  findChallenges(@Param('id') groupId: string) {
    return this.groupService.findChallenges(groupId);
  }

  @ApiOperation({ 
    summary: 'Criar novo grupo',
    description: 'Cria um novo grupo de leitura, com o usuário autenticado como proprietário'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Grupo criado com sucesso'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Req() req: RequestWithUser) {
    return this.groupService.create(createGroupDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Atualizar grupo existente',
    description: 'Atualiza informações de um grupo existente (apenas o proprietário pode atualizar)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Grupo atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o proprietário pode atualizar o grupo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.update(id, updateGroupDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Transferir propriedade do grupo',
    description: 'Transfere a propriedade do grupo para outro membro (apenas o proprietário atual pode realizar esta ação)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Propriedade transferida com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o proprietário pode transferir a propriedade do grupo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/transfer-ownership')
  transferOwnership(
    @Param('id') groupId: string,
    @Body() transferOwnershipDto: TransferOwnershipDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.transferOwnership(
      groupId,
      transferOwnershipDto.newOwnerId,
      req.user.id
    );
  }

  @ApiOperation({ 
    summary: 'Convidar usuário para o grupo',
    description: 'Convida um usuário para se juntar ao grupo (apenas admins ou proprietário podem convidar)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário convidado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admins ou o proprietário podem convidar membros'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/invite')
  inviteMember(
    @Param('id') groupId: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.inviteMember(groupId, inviteMemberDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Aprovar solicitação de membro',
    description: 'Aprova a solicitação de um usuário para entrar no grupo (apenas admins ou proprietário podem aprovar)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Membro aprovado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admins ou o proprietário podem aprovar membros'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/approve')
  approveMember(
    @Param('id') groupId: string,
    @Body() memberActionDto: MemberActionDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.approveMember(groupId, memberActionDto.memberId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Rejeitar solicitação de membro',
    description: 'Rejeita a solicitação de um usuário para entrar no grupo (apenas admins ou proprietário podem rejeitar)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação rejeitada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admins ou o proprietário podem rejeitar solicitações'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/reject')
  rejectMember(
    @Param('id') groupId: string,
    @Body() memberActionDto: MemberActionDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.rejectMember(groupId, memberActionDto.memberId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Solicitar entrada em grupo',
    description: 'Permite que o usuário autenticado solicite entrada em um grupo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação de entrada realizada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário já é membro deste grupo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') groupId: string, @Req() req: RequestWithUser) {
    return this.groupService.joinGroup(groupId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Sair de um grupo',
    description: 'Permite que o usuário autenticado saia de um grupo (proprietários não podem sair)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Saída do grupo realizada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Proprietário não pode sair do grupo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leaveGroup(@Param('id') groupId: string, @Req() req: RequestWithUser) {
    return this.groupService.leaveGroup(groupId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Promover membro a administrador',
    description: 'Promove um membro do grupo a administrador (apenas o proprietário pode promover)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Membro promovido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou membro não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o proprietário pode promover membros'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/promote')
  promoteMember(
    @Param('id') groupId: string,
    @Body() memberActionDto: MemberActionDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.promoteMember(groupId, memberActionDto.memberId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Rebaixar administrador para membro comum',
    description: 'Rebaixa um administrador para membro comum (apenas o proprietário pode rebaixar)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Administrador rebaixado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou administrador não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o proprietário pode rebaixar administradores'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/demote')
  demoteMember(
    @Param('id') groupId: string,
    @Body() memberActionDto: MemberActionDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.demoteMember(groupId, memberActionDto.memberId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Remover membro do grupo',
    description: 'Remove um membro do grupo (proprietário não pode ser removido, apenas admins podem remover membros)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Membro removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou membro não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admins ou o proprietário podem remover membros / Proprietário não pode ser removido'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/remove-member')
  removeMember(
    @Param('id') groupId: string,
    @Body() memberActionDto: MemberActionDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.removeMember(groupId, memberActionDto.memberId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Criar desafio para o grupo',
    description: 'Cria um novo desafio interno para o grupo (apenas admins ou o proprietário podem criar desafios)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Desafio criado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admins ou proprietário podem criar desafios'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/challenges')
  createChallenge(
    @Param('id') groupId: string,
    @Body() createGroupChallengeDto: CreateGroupChallengeDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.createChallenge(groupId, createGroupChallengeDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Completar desafio do grupo',
    description: 'Marca um desafio do grupo como completado pelo usuário autenticado, concedendo pontos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Desafio completado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou desafio não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não é membro deste grupo ou desafio já completado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiParam({
    name: 'challengeId',
    description: 'ID único do desafio',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/challenges/:challengeId/complete')
  completeChallenge(
    @Param('id') groupId: string,
    @Param('challengeId') challengeId: string,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.completeChallenge(groupId, challengeId, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Remover grupo',
    description: 'Remove um grupo existente (apenas o proprietário pode remover o grupo)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Grupo removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o proprietário pode remover o grupo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.groupService.remove(id, req.user.id);
  }
} 