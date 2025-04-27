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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Listar todos os grupos públicos' })
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

  @ApiOperation({ summary: 'Buscar grupo por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Grupo encontrado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @ApiOperation({ summary: 'Buscar grupos em que um usuário participa' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos do usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('member/:userId')
  findByMember(@Param('userId') userId: string) {
    return this.groupService.findByMember(userId);
  }

  @ApiOperation({ summary: 'Buscar grupos criados por um usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos criados pelo usuário retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('owner/:userId')
  findByOwner(@Param('userId') userId: string) {
    return this.groupService.findByOwner(userId);
  }

  @ApiOperation({ summary: 'Ver membros de um grupo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de membros do grupo retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @Get(':id/members')
  findMembers(@Param('id') groupId: string) {
    return this.groupService.findMembers(groupId);
  }

  @ApiOperation({ summary: 'Ver ranking interno de um grupo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking do grupo retornado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @Get(':id/leaderboard')
  getLeaderboard(@Param('id') groupId: string) {
    return this.groupService.getLeaderboard(groupId);
  }

  @ApiOperation({ summary: 'Listar desafios de um grupo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de desafios do grupo retornada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @Get(':id/challenges')
  findChallenges(@Param('id') groupId: string) {
    return this.groupService.findChallenges(groupId);
  }

  @ApiOperation({ summary: 'Criar novo grupo' })
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

  @ApiOperation({ summary: 'Atualizar grupo existente' })
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

  @ApiOperation({ summary: 'Transferir propriedade do grupo' })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/transfer-ownership')
  transferOwnership(
    @Param('id') groupId: string,
    @Body() transferOwnershipDto: TransferOwnershipDto,
    @Req() req: RequestWithUser
  ) {
    return this.groupService.transferOwnership(groupId, transferOwnershipDto.newOwnerId, req.user.id);
  }

  @ApiOperation({ summary: 'Convidar usuário para o grupo' })
  @ApiResponse({ 
    status: 201, 
    description: 'Convite enviado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admin ou proprietário pode convidar membros'
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

  @ApiOperation({ summary: 'Aprovar solicitação de entrada no grupo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação aprovada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo, usuário ou solicitação não encontrada'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admin ou proprietário pode aprovar solicitações'
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

  @ApiOperation({ summary: 'Rejeitar solicitação de entrada no grupo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação rejeitada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo, usuário ou solicitação não encontrada'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas admin ou proprietário pode rejeitar solicitações'
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

  @ApiOperation({ summary: 'Solicitar entrada em um grupo' })
  @ApiResponse({ 
    status: 201, 
    description: 'Solicitação enviada com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário já é membro ou já solicitou entrada'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') groupId: string, @Req() req: RequestWithUser) {
    return this.groupService.joinGroup(groupId, req.user.id);
  }

  @ApiOperation({ summary: 'Sair de um grupo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário removido do grupo com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não é membro deste grupo ou é o proprietário'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leaveGroup(@Param('id') groupId: string, @Req() req: RequestWithUser) {
    return this.groupService.leaveGroup(groupId, req.user.id);
  }

  @ApiOperation({ summary: 'Promover membro a admin' })
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

  @ApiOperation({ summary: 'Rebaixar admin para membro' })
  @ApiResponse({ 
    status: 200, 
    description: 'Admin rebaixado com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou admin não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Apenas o proprietário pode rebaixar admins'
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

  @ApiOperation({ summary: 'Remover membro do grupo' })
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
    description: 'Apenas admins ou proprietário podem remover membros'
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

  @ApiOperation({ summary: 'Criar desafio para o grupo' })
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

  @ApiOperation({ summary: 'Completar desafio do grupo' })
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

  @ApiOperation({ summary: 'Remover grupo' })
  @ApiResponse({ 
    status: 204, 
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.groupService.remove(id, req.user.id);
  }
} 