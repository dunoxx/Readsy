import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  /**
   * Obtém o ranking global dos 100 primeiros usuários
   * Critérios de ordenação:
   * 1. Maior seasonXP
   * 2. Quem atingiu primeiro (lastLevelUpAt)
   * 3. Usuário mais antigo (createdAt)
   * 4. Usuário com mais livros cadastrados
   * 5. Usuário que participa de mais grupos
   */
  async getGlobalRanking() {
    // Buscar os top 100 usuários por XP de temporada
    const topUsers = await this.prisma.user.findMany({
      where: {
        suspended: false,
      },
      select: {
        id: true,
        displayName: true,
        profilePicture: true,
        level: true,
        seasonXp: true,
        totalXp: true,
        lastLevelUpAt: true,
        createdAt: true,
        books: {
          select: {
            id: true,
          },
        },
        groupMembers: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { seasonXp: 'desc' },
        { lastLevelUpAt: 'asc' },
        { createdAt: 'asc' },
      ],
      take: 100,
    });

    // Processar informações e calcular posições
    const rankedUsers = topUsers.map((user, i) => {
      let position = i + 1;
      
      // Verificar se há um empate técnico com o usuário anterior
      if (i > 0) {
        const prevUser = topUsers[i - 1];
        
        if (
          user.seasonXp === prevUser.seasonXp &&
          ((user.lastLevelUpAt && prevUser.lastLevelUpAt && 
            user.lastLevelUpAt.getTime() === prevUser.lastLevelUpAt.getTime()) ||
           (!user.lastLevelUpAt && !prevUser.lastLevelUpAt)) &&
          user.createdAt.getTime() === prevUser.createdAt.getTime() &&
          user.books.length === prevUser.books.length &&
          user.groupMembers.length === prevUser.groupMembers.length
        ) {
          // Empate técnico, usar a mesma posição
          position = i;
        }
      }

      return {
        position,
        userId: user.id,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        level: user.level,
        seasonXP: user.seasonXp,
        totalBooks: user.books.length,
        totalGroups: user.groupMembers.length,
      };
    });

    return rankedUsers;
  }

  /**
   * Obtém o ranking dos 100 primeiros usuários de um grupo específico
   * Usa os mesmos critérios do ranking global
   */
  async getGroupRanking(groupId: string) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Buscar os membros do grupo
    const groupMembers = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: {
        userId: true,
      },
    });

    if (groupMembers.length === 0) {
      return [];
    }

    // Obter lista de IDs dos usuários do grupo
    const userIds = groupMembers.map(member => member.userId);

    // Buscar os usuários do grupo com seus dados de XP e outros critérios
    const groupUsers = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        suspended: false,
      },
      select: {
        id: true,
        displayName: true,
        profilePicture: true,
        level: true,
        seasonXp: true,
        totalXp: true,
        lastLevelUpAt: true,
        createdAt: true,
        books: {
          select: {
            id: true,
          },
        },
        groupMembers: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { seasonXp: 'desc' },
        { lastLevelUpAt: 'asc' },
        { createdAt: 'asc' },
      ],
      take: 100,
    });

    // Processar informações e calcular posições
    const rankedUsers = groupUsers.map((user, i) => {
      let position = i + 1;
      
      // Verificar se há um empate técnico com o usuário anterior
      if (i > 0) {
        const prevUser = groupUsers[i - 1];
        
        if (
          user.seasonXp === prevUser.seasonXp &&
          ((user.lastLevelUpAt && prevUser.lastLevelUpAt && 
            user.lastLevelUpAt.getTime() === prevUser.lastLevelUpAt.getTime()) ||
           (!user.lastLevelUpAt && !prevUser.lastLevelUpAt)) &&
          user.createdAt.getTime() === prevUser.createdAt.getTime() &&
          user.books.length === prevUser.books.length &&
          user.groupMembers.length === prevUser.groupMembers.length
        ) {
          // Empate técnico, usar a mesma posição
          position = i;
        }
      }

      return {
        position,
        userId: user.id,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        level: user.level,
        seasonXP: user.seasonXp,
        totalBooks: user.books.length,
        totalGroups: user.groupMembers.length,
      };
    });

    return rankedUsers;
  }

  /**
   * Adiciona pontos para um usuário no leaderboard
   */
  async addPoints(userId: string, points: number, season: string = this.getCurrentSeason()) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Buscar entrada existente ou criar uma nova
    let entry = await this.prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        season,
      },
    });

    if (!entry) {
      // Criar nova entrada
      entry = await this.prisma.leaderboardEntry.create({
        data: {
          user: {
            connect: { id: userId },
          },
          score: points,
          season,
        },
      });
    } else {
      // Atualizar entrada existente
      entry = await this.prisma.leaderboardEntry.update({
        where: { id: entry.id },
        data: {
          score: entry.score + points,
        },
      });
    }

    return entry;
  }

  /**
   * Obter usuário por posição no leaderboard
   */
  async getUserRanking(userId: string, season: string = this.getCurrentSeason()) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        profilePicture: true,
        level: true,
        seasonXp: true,
        lastLevelUpAt: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Obter todos os usuários com XP maior para calcular a posição
    const usersWithMoreXp = await this.prisma.user.count({
      where: {
        seasonXp: {
          gt: user.seasonXp,
        },
        suspended: false,
      },
    });

    // Contar usuários empatados para verificar posição
    const tiedUsers = await this.prisma.user.count({
      where: {
        seasonXp: user.seasonXp,
        lastLevelUpAt: {
          lt: user.lastLevelUpAt || undefined,
        },
        suspended: false,
      },
    });

    // Calcular a posição do usuário
    const position = usersWithMoreXp + tiedUsers + 1;

    return {
      position,
      userId: user.id,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      level: user.level,
      seasonXP: user.seasonXp,
    };
  }

  /**
   * Resetar temporada e distribuir prêmios
   */
  async resetSeason() {
    // Obter o ranking global atual
    const topUsers = await this.getGlobalRanking();
    
    // Criar nova temporada
    const newSeason = await this.createNewSeason();
    
    // Distribuir moedas de acordo com o ranking
    const rewardedUsers = await this.distributeRewards(topUsers);
    
    // Resetar XP da temporada e níveis para todos os usuários
    await this.prisma.user.updateMany({
      data: {
        seasonXp: 0,
        level: 1,
      },
    });
    
    return {
      newSeason,
      rewardedUsers,
    };
  }

  /**
   * Distribuir recompensas de fim de temporada
   */
  private async distributeRewards(topUsers: any[]) {
    const rewards = [];
    
    // Processar recompensas para cada usuário
    for (const user of topUsers) {
      let coinsToAdd = 0;
      
      // Determinar a quantidade de moedas com base na posição
      if (user.position === 1) {
        coinsToAdd = 4000; // 1º lugar
      } else if (user.position === 2) {
        coinsToAdd = 2500; // 2º lugar
      } else if (user.position === 3) {
        coinsToAdd = 1500; // 3º lugar
      } else if (user.position >= 4 && user.position <= 10) {
        coinsToAdd = 1000; // 4º-10º lugares
      } else if (user.position >= 11 && user.position <= 100) {
        coinsToAdd = 100; // 11º-100º lugares
      }
      
      if (coinsToAdd > 0) {
        // Adicionar moedas ao usuário
        await this.prisma.user.update({
          where: { id: user.userId },
          data: {
            coins: {
              increment: coinsToAdd,
            },
          },
        });
        
        rewards.push({
          userId: user.userId,
          position: user.position,
          coinsRewarded: coinsToAdd,
        });
      }
    }
    
    return rewards;
  }

  /**
   * Criar nova temporada baseada na estação do ano
   */
  private async createNewSeason() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    
    let seasonName, seasonDisplayName, startDate, endDate;
    
    // Determinar a estação atual e as datas de início e fim
    const month = currentDate.getMonth() + 1;
    
    if (month >= 3 && month <= 5) {
      // Primavera (21 de março a 21 de junho)
      seasonName = `${year}-Spring`;
      seasonDisplayName = `Primavera ${year}`;
      startDate = new Date(year, 2, 21); // 21 de março
      endDate = new Date(year, 5, 21);   // 21 de junho
    } else if (month >= 6 && month <= 8) {
      // Verão (21 de junho a 23 de setembro)
      seasonName = `${year}-Summer`;
      seasonDisplayName = `Verão ${year}`;
      startDate = new Date(year, 5, 21); // 21 de junho
      endDate = new Date(year, 8, 23);   // 23 de setembro
    } else if (month >= 9 && month <= 11) {
      // Outono (23 de setembro a 21 de dezembro)
      seasonName = `${year}-Fall`;
      seasonDisplayName = `Outono ${year}`;
      startDate = new Date(year, 8, 23); // 23 de setembro
      endDate = new Date(year, 11, 21);  // 21 de dezembro
    } else {
      // Inverno (21 de dezembro a 21 de março do próximo ano)
      seasonName = `${year}-Winter`;
      seasonDisplayName = `Inverno ${year}`;
      startDate = new Date(year, 11, 21); // 21 de dezembro
      endDate = new Date(year + 1, 2, 21); // 21 de março do próximo ano
    }
    
    // Verificar se já existe uma temporada com esse nome
    const existingSeason = await this.prisma.season.findFirst({
      where: { name: seasonName },
    });
    
    if (existingSeason) {
      // Se existir e não estiver ativa, ativar
      if (!existingSeason.isActive) {
        return this.prisma.season.update({
          where: { id: existingSeason.id },
          data: { 
            isActive: true,
            startDate: startDate,
            endDate: endDate,
          },
        });
      }
      return existingSeason;
    }
    
    // Criar nova temporada
    return this.prisma.season.create({
      data: {
        name: seasonName,
        displayName: seasonDisplayName,
        startDate,
        endDate,
        isActive: true,
      },
    });
  }

  /**
   * Obter temporada atual (nome)
   */
  private getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    if (month >= 3 && month <= 5) {
      return `${year}-Spring`;
    } else if (month >= 6 && month <= 8) {
      return `${year}-Summer`;
    } else if (month >= 9 && month <= 11) {
      return `${year}-Fall`;
    } else {
      return `${year}-Winter`;
    }
  }
} 