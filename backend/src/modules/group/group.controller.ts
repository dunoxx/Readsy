import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Listar todos os grupos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de grupos retornada com sucesso'
  })
  @Get()
  findAll() {
    return this.groupService.findAll();
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

  @ApiOperation({ summary: 'Entrar em um grupo' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário adicionado ao grupo com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grupo ou usuário não encontrado'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário já é membro deste grupo'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':groupId/join')
  joinGroup(@Param('groupId') groupId: string, @Req() req: RequestWithUser) {
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
  @Post(':groupId/leave')
  leaveGroup(@Param('groupId') groupId: string, @Req() req: RequestWithUser) {
    return this.groupService.leaveGroup(groupId, req.user.id);
  }
} 