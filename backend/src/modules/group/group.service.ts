import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os grupos
  async findAll() {
    return this.prisma.group.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
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
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    return group;
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
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                  },
                },
              },
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
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
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
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
      throw new BadRequestException('Apenas o proprietário do grupo pode atualizá-lo');
    }

    // Atualizar o grupo
    return this.prisma.group.update({
      where: { id },
      data: {
        name: updateGroupDto.name,
        description: updateGroupDto.description,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
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
} 