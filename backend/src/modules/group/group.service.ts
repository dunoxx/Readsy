import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { InviteMemberDto } from './dtos/invite-member.dto';
import { CreateGroupChallengeDto } from './dtos/create-group-challenge.dto';
import { ChallengeFrequency } from './dtos/create-group-challenge.dto';
import { QuestType, Role } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os grupos públicos
  async findAll(query?: string) {
    const whereCondition = query 
      ? {
          isPublic: true,
          name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        }
      : { isPublic: true };

    return this.prisma.group.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            members: true,
          }
        },
      },
    });
  }

  // Buscar grupo por ID
  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            members: true,
            groupChallenges: true,
          }
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    return group;
  }

  // Buscar membros de um grupo
  async findMembers(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    return this.prisma.groupMember.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER primeiro, depois ADMIN, depois MEMBER
        { points: 'desc' }, // Mais pontos primeiro
        { lastActivityAt: 'desc' }, // Mais recente atividade primeiro
      ],
    });
  }

  // Buscar grupos que um usuário participa
  async findByMember(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.groupMember.findMany({
      where: {
        userId,
      },
      include: {
        group: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
            _count: {
              select: {
                members: true,
              }
            },
          },
        },
      },
    });
  }

  // Buscar grupos criados por um usuário
  async findByOwner(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.group.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        _count: {
          select: {
            members: true,
          }
        },
      },
    });
  }

  // Obter ranking do grupo
  async getLeaderboard(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Buscar todos os membros do grupo
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Ordenar membros manualmente pelos critérios fornecidos
    const sortedMembers = [...members].sort((a, b) => {
      // 1. Mais pontos primeiro
      if ((a as any).points !== (b as any).points) {
        return (b as any).points - (a as any).points;
      }
      
      // 2. Mais desafios completados primeiro
      if ((a as any).completedChallenges !== (b as any).completedChallenges) {
        return (b as any).completedChallenges - (a as any).completedChallenges;
      }
      
      // 3. Quem entrou primeiro no grupo
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    // Adicionar a posição de cada membro no ranking
    const leaderboard = sortedMembers.map((member, index) => {
      return {
        position: index + 1,
        userId: member.user.id,
        username: member.user.username,
        displayName: member.user.displayName,
        profilePicture: member.user.profilePicture,
        points: (member as any).points || 0,
        completedChallenges: (member as any).completedChallenges || 0,
        joinedAt: member.joinedAt,
        lastActivityAt: (member as any).lastActivityAt || member.joinedAt,
      };
    });

    return leaderboard;
  }

  // Listar desafios de um grupo
  async findChallenges(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    return this.prisma.groupChallenge.findMany({
      where: {
        groupId,
      },
      include: {
        _count: {
          select: {
            userCompletions: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Criar novo grupo
  async create(createGroupDto: CreateGroupDto, userId: string) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Criar o grupo e adicionar o criador como membro com papel de proprietário
    return this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
        imageUrl: createGroupDto.imageUrl,
        isPublic: createGroupDto.isPublic ?? true,
        requiresApproval: createGroupDto.requiresApproval ?? false,
        owner: {
          connect: { id: userId },
        },
        members: {
          create: [
            {
              user: {
                connect: { id: userId },
              },
              role: 'OWNER',
            },
          ],
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  }

  // Atualizar grupo
  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o dono do grupo
    if (group.ownerId !== userId) {
      throw new ForbiddenException('Apenas o proprietário do grupo pode atualizá-lo');
    }

    // Atualizar o grupo
    return this.prisma.group.update({
      where: { id },
      data: {
        name: updateGroupDto.name,
        description: updateGroupDto.description,
        imageUrl: updateGroupDto.imageUrl,
        isPublic: updateGroupDto.isPublic,
        requiresApproval: updateGroupDto.requiresApproval,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            members: true,
          }
        },
      },
    });
  }

  // Transferir propriedade do grupo
  async transferOwnership(groupId: string, newOwnerId: string, currentOwnerId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o usuário atual é o dono do grupo
    if (group.ownerId !== currentOwnerId) {
      throw new ForbiddenException('Apenas o proprietário atual do grupo pode transferir a propriedade');
    }

    // Verificar se o novo proprietário existe e é membro do grupo
    const newOwnerMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: newOwnerId,
        },
      },
    });

    if (!newOwnerMembership) {
      throw new BadRequestException('O novo proprietário deve ser um membro do grupo');
    }

    // Atualizar papel do proprietário atual para ADMIN
    await this.prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: currentOwnerId,
        },
      },
      data: {
        role: 'ADMIN',
      },
    });

    // Atualizar papel do novo proprietário para OWNER
    await this.prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId: newOwnerId,
        },
      },
      data: {
        role: 'OWNER',
      },
    });

    // Atualizar proprietário do grupo
    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        ownerId: newOwnerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    return {
      message: 'Propriedade do grupo transferida com sucesso',
      group: updatedGroup,
    };
  }

  // Verificar se o usuário é admin ou proprietário do grupo
  private async isAdminOrOwner(groupId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return member?.role === 'OWNER' || member?.role === 'ADMIN';
  }

  // Convidar um usuário para o grupo
  async inviteMember(groupId: string, inviteMemberDto: InviteMemberDto, inviterId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o usuário que está fazendo o convite é admin ou proprietário
    if (!(await this.isAdminOrOwner(groupId, inviterId))) {
      throw new ForbiddenException('Apenas admins ou o proprietário podem convidar membros');
    }

    // Verificar se o convite é por ID ou email
    let targetUserId: string;

    if (inviteMemberDto.userId) {
      // Convite por ID
      const targetUser = await this.prisma.user.findUnique({
        where: { id: inviteMemberDto.userId },
      });

      if (!targetUser) {
        throw new NotFoundException(`Usuário com ID ${inviteMemberDto.userId} não encontrado`);
      }

      targetUserId = targetUser.id;
    } else if (inviteMemberDto.email) {
      // Convite por email
      const targetUser = await this.prisma.user.findUnique({
        where: { email: inviteMemberDto.email },
      });

      if (!targetUser) {
        throw new NotFoundException(`Usuário com email ${inviteMemberDto.email} não encontrado`);
      }

      targetUserId = targetUser.id;
    } else {
      throw new BadRequestException('É necessário fornecer um ID de usuário ou email');
    }

    // Verificar se o usuário já é membro do grupo
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('O usuário já é membro deste grupo');
    }

    // Verificar se já existe uma solicitação pendente para este usuário
    const existingRequest = await this.prisma.groupJoinRequest.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (existingRequest && existingRequest.status === 'PENDING') {
      throw new BadRequestException('Já existe uma solicitação pendente para este usuário');
    }

    // Adicionar o usuário diretamente como membro (sem aprovação necessária)
    const newMember = await this.prisma.groupMember.create({
      data: {
        group: {
          connect: { id: groupId },
        },
        user: {
          connect: { id: targetUserId },
        },
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    return {
      message: 'Usuário adicionado ao grupo com sucesso',
      member: newMember,
    };
  }

  // Remover grupo
  async remove(id: string, userId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o dono do grupo
    if (group.ownerId !== userId) {
      throw new BadRequestException('Apenas o proprietário do grupo pode removê-lo');
    }

    // Remover todos os membros primeiro
    await this.prisma.groupMember.deleteMany({
      where: { groupId: id },
    });

    // Remover o grupo
    await this.prisma.group.delete({
      where: { id },
    });

    return { message: 'Grupo removido com sucesso' };
  }

  // Entrar em um grupo
  async joinGroup(groupId: string, userId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário já é membro do grupo
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Usuário já é membro deste grupo');
    }

    // Adicionar o usuário como membro
    return this.prisma.groupMember.create({
      data: {
        group: {
          connect: { id: groupId },
        },
        user: {
          connect: { id: userId },
        },
        role: 'MEMBER',
      },
      include: {
        group: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  // Sair de um grupo
  async leaveGroup(groupId: string, userId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário é membro do grupo
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('Usuário não é membro deste grupo');
    }

    // Não permitir que o proprietário saia do grupo
    if (membership.role === 'OWNER') {
      throw new BadRequestException('O proprietário não pode sair do grupo. Transfira a propriedade ou delete o grupo.');
    }

    // Remover o usuário do grupo
    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return { message: 'Usuário removido do grupo com sucesso' };
  }

  // Criar desafio interno para o grupo
  async createChallenge(groupId: string, createGroupChallengeDto: CreateGroupChallengeDto, userId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o usuário é admin ou dono do grupo
    if (!(await this.isAdminOrOwner(groupId, userId))) {
      throw new BadRequestException('Apenas administradores ou o proprietário podem criar desafios');
    }

    // Se for desafio de leitura de livro, verificar se o livro existe
    if (createGroupChallengeDto.type === QuestType.READ_PAGES && createGroupChallengeDto.bookId) {
      const book = await this.prisma.book.findUnique({
        where: { id: createGroupChallengeDto.bookId },
      });

      if (!book) {
        throw new NotFoundException(`Livro com ID ${createGroupChallengeDto.bookId} não encontrado`);
      }
    }

    // Criar o desafio
    return this.prisma.groupChallenge.create({
      data: {
        group: {
          connect: { id: groupId },
        },
        title: createGroupChallengeDto.title,
        description: createGroupChallengeDto.description,
        type: createGroupChallengeDto.type,
        target: createGroupChallengeDto.target,
        bookId: createGroupChallengeDto.bookId,
        pointsReward: createGroupChallengeDto.pointsReward,
        frequency: createGroupChallengeDto.frequency,
        createdBy: userId,
        endDate: new Date(createGroupChallengeDto.endDate),
      },
      include: {
        _count: {
          select: {
            userCompletions: true,
          }
        },
      },
    });
  }

  // Completar desafio do grupo
  async completeChallenge(groupId: string, challengeId: string, userId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o desafio existe e pertence ao grupo
    const challenge = await this.prisma.groupChallenge.findFirst({
      where: {
        id: challengeId,
        groupId,
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${challengeId} não encontrado no grupo ${groupId}`);
    }

    // Verificar se o usuário é membro do grupo
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('Você não é membro deste grupo');
    }

    // Verificar se o usuário já completou este desafio
    const existingCompletion = await this.prisma.userGroupChallenge.findUnique({
      where: {
        userId_groupChallengeId: {
          userId,
          groupChallengeId: challengeId,
        },
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('Você já completou este desafio');
    }

    // Registrar conclusão do desafio
    await this.prisma.userGroupChallenge.create({
      data: {
        user: {
          connect: { id: userId },
        },
        groupChallenge: {
          connect: { id: challengeId },
        },
        xpEarned: challenge.pointsReward,
      },
    });

    // Atualizar estatísticas do membro no grupo
    await this.prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        points: { increment: challenge.pointsReward },
        completedChallenges: { increment: 1 },
        lastActivityAt: new Date(),
      },
    });

    return {
      message: 'Desafio completado com sucesso',
      pointsEarned: challenge.pointsReward,
    };
  }
} 