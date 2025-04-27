import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLogService } from './admin-log.service';
import { UserService } from '../user/user.service';
import { QuestService } from '../quest/quest.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../user/dtos/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private adminLogService: AdminLogService,
    private userService: UserService,
  ) {}

  /**
   * Listar todos os usuários com opções de filtragem e paginação
   */
  async findAllUsers(options: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      search, 
      role, 
      page = 1, 
      limit = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
          { id: search },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          profilePicture: true,
          role: true,
          level: true,
          totalXp: true,
          coins: true,
          suspended: true,
          createdAt: true,
          updatedAt: true,
          lastCheckInDate: true,
          country: true,
          language: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Buscar usuário por ID
   */
  async findUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        backgroundPicture: true,
        bio: true,
        role: true,
        level: true,
        totalXp: true,
        seasonXp: true,
        coins: true,
        streak: true,
        suspended: true,
        dateOfBirth: true,
        country: true,
        language: true,
        lastCheckInDate: true,
        lastLevelUpAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            books: true,
            checkins: true,
            badges: true,
            achievements: true,
            posts: true,
          }
        }
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  /**
   * Atualizar um usuário
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto, adminId: string) {
    const user = await this.findUser(id);
    
    // Verificar se o usuário a ser atualizado existe
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    
    // Atualizar usuário usando o UserService
    const updatedUser = await this.userService.update(id, updateUserDto);
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      adminId,
      'UPDATE_USER',
      'user',
      id,
      { updatedFields: Object.keys(updateUserDto) }
    );
    
    return updatedUser;
  }

  /**
   * Bloquear/Desbloquear um usuário
   */
  async toggleUserSuspension(userId: string, suspend: boolean, adminId: string) {
    const user = await this.findUser(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }
    
    // Evitar que administradores bloqueiem outros administradores ou a si mesmos
    if (user.role === 'ADMIN' || user.role === 'OWNER') {
      throw new UnauthorizedException('Não é possível bloquear um administrador');
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { suspended: suspend },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        suspended: true,
      },
    });
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      adminId,
      suspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      'user',
      userId,
      { suspended }
    );
    
    return updatedUser;
  }

  /**
   * Alterar a função (role) de um usuário
   */
  async changeUserRole(userId: string, role: 'ADMIN' | 'MEMBER', adminId: string, adminPassword: string) {
    const user = await this.findUser(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }
    
    // Verificar se o administrador está tentando rebaixar um OWNER
    if (user.role === 'OWNER') {
      throw new UnauthorizedException('Não é possível alterar o papel do proprietário do sistema');
    }
    
    // Verificar a senha do administrador para ações sensíveis
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, password: true, role: true },
    });
    
    if (!admin || admin.role !== 'OWNER') {
      throw new UnauthorizedException('Apenas o proprietário do sistema pode alterar papéis de administradores');
    }
    
    const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha do administrador incorreta');
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
      },
    });
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      adminId,
      'CHANGE_USER_ROLE',
      'user',
      userId,
      { previousRole: user.role, newRole: role }
    );
    
    return updatedUser;
  }
  
  /**
   * Gerenciamento de grupos
   */
  
  // Listar grupos com opções de filtragem e paginação
  async findAllGroups(options: {
    search?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      search, 
      isPublic, 
      page = 1, 
      limit = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { id: search },
        ],
      }),
      ...(isPublic !== undefined && { isPublic }),
    };

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
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
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.group.count({ where })
    ]);

    return {
      data: groups,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Atualizar um grupo
   */
  async updateGroup(groupId: string, data: { name?: string; description?: string; isPublic?: boolean }, adminId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
    
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }
    
    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      adminId,
      'UPDATE_GROUP',
      'group',
      groupId,
      { updatedFields: Object.keys(data) }
    );
    
    return updatedGroup;
  }

  /**
   * Transferir propriedade de um grupo
   */
  async transferGroupOwnership(groupId: string, newOwnerId: string, adminId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
    
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }
    
    // Verificar se o novo proprietário existe
    const newOwner = await this.prisma.user.findUnique({
      where: { id: newOwnerId },
    });
    
    if (!newOwner) {
      throw new NotFoundException(`Usuário com ID ${newOwnerId} não encontrado`);
    }
    
    // Verificar se o novo proprietário é membro do grupo
    const isMember = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: newOwnerId,
        },
      },
    });
    
    if (!isMember) {
      // Adicionar o novo proprietário como membro do grupo se ele não for
      await this.prisma.groupMember.create({
        data: {
          groupId,
          userId: newOwnerId,
          role: 'ADMIN', // Já adiciona como admin
        },
      });
    } else {
      // Atualizar o papel do novo proprietário para ADMIN
      await this.prisma.groupMember.update({
        where: {
          groupId_userId: {
            groupId,
            userId: newOwnerId,
          },
        },
        data: {
          role: 'ADMIN',
        },
      });
    }
    
    // Transferir a propriedade
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
          },
        },
      },
    });
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      adminId,
      'TRANSFER_GROUP_OWNERSHIP',
      'group',
      groupId,
      { 
        previousOwnerId: group.owner.id,
        newOwnerId
      }
    );
    
    return updatedGroup;
  }

  /**
   * Excluir um grupo
   */
  async deleteGroup(groupId: string, adminId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
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
          },
        },
      },
    });
    
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }
    
    // Registrar informações do grupo antes de excluí-lo
    const groupInfo = {
      id: group.id,
      name: group.name,
      ownerId: group.owner.id,
      ownerName: group.owner.displayName,
      membersCount: group._count.members,
    };
    
    // Excluir o grupo
    await this.prisma.group.delete({
      where: { id: groupId },
    });
    
    // Registrar ação no log de administração
    await this.adminLogService.log(
      adminId,
      'DELETE_GROUP',
      'group',
      groupId,
      groupInfo
    );
    
    return { 
      message: 'Grupo excluído com sucesso',
      deletedGroup: groupInfo
    };
  }
} 