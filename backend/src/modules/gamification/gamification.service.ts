import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class GamificationService {
  // Sequência de Fibonacci para XP por nível
  private readonly xpRequirements = [0, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500];
  
  // Sequência de Fibonacci para Coins por nível
  private readonly levelUpCoins = [0, 5, 5, 10, 15, 25, 40, 65, 105, 170, 275];
  
  // XP dos desafios baseados em Fibonacci
  private readonly challengeXpOptions = [10, 20, 30, 50, 80, 130, 210, 340, 550];
  
  // Coins dos desafios baseados em Fibonacci
  private readonly challengeCoinsOptions = [0, 5, 10, 15, 25, 30];
  
  // Nível máximo permitido
  private readonly MAX_LEVEL: number;
  
  // XP máximo permitido
  private readonly MAX_XP: number;

  constructor(
    private prisma: PrismaService,
    private leaderboardService: LeaderboardService,
    private configService: ConfigService,
  ) {
    this.MAX_LEVEL = this.configService.get<number>('GAMIFICATION_MAX_LEVEL') || 10;
    this.MAX_XP = this.configService.get<number>('GAMIFICATION_MAX_XP') || 5500;
  }

  // Obter status de gamificação do usuário
  async getUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePicture: true,
        level: true,
        totalXp: true,
        seasonXp: true,
        coins: true,
        streak: true,
        lastCheckInDate: true,
        lastLevelUpAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Obter a classificação do usuário no leaderboard
    const leaderboardPosition = await this.leaderboardService.getUserRanking(userId);

    // Obter informações da temporada atual
    const currentSeason = await this.getCurrentSeason();

    // Calcular XP necessário para o próximo nível
    const nextLevelXp = user.level < this.MAX_LEVEL 
      ? this.xpRequirements[user.level] 
      : this.MAX_XP;
    
    const xpForNextLevel = nextLevelXp - user.seasonXp;

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
      },
      gamification: {
        level: user.level,
        totalXp: user.totalXp,
        seasonXp: user.seasonXp,
        coins: user.coins,
        streak: user.streak,
        lastCheckInDate: user.lastCheckInDate,
        lastLevelUpAt: user.lastLevelUpAt,
        xpForNextLevel: user.level < this.MAX_LEVEL ? xpForNextLevel : 0,
        isMaxLevel: user.level >= this.MAX_LEVEL,
        badges: user.badges.map(badge => ({
          id: badge.badge.id,
          name: badge.badge.name,
          description: badge.badge.description,
          icon: badge.badge.icon,
          category: badge.badge.category,
          rarity: badge.badge.rarity,
          earnedAt: badge.earnedAt,
        })),
        achievements: user.achievements.map(achievement => ({
          id: achievement.achievement.id,
          name: achievement.achievement.name,
          description: achievement.achievement.description,
          icon: achievement.achievement.icon,
          goal: achievement.achievement.goal,
          progress: achievement.progress,
          completed: achievement.completed,
          completedAt: achievement.completedAt,
        })),
      },
      leaderboard: {
        rank: leaderboardPosition.rank,
        score: leaderboardPosition.score,
        season: currentSeason.name,
      },
      season: {
        id: currentSeason.id,
        name: currentSeason.name,
        displayName: currentSeason.displayName,
        startDate: currentSeason.startDate,
        endDate: currentSeason.endDate,
      },
    };
  }

  // Adicionar XP para um usuário
  async addXp(userId: string, xpAmount: number) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Obter a temporada atual
    const currentSeason = await this.getCurrentSeason();

    // Verificar se o usuário já está no nível máximo e com XP máximo
    if (user.level >= this.MAX_LEVEL && user.seasonXp >= this.MAX_XP) {
      // Se estiver no máximo, apenas incrementa o XP total, não o da temporada
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: user.totalXp + xpAmount,
        },
      });

      // Atualizar pontuação no leaderboard
      await this.leaderboardService.addPoints(userId, xpAmount, currentSeason.name);

      return {
        level: user.level,
        previousXp: user.seasonXp,
        currentXp: user.seasonXp, // Mantém o mesmo XP da temporada
        totalXp: user.totalXp + xpAmount,
        leveledUp: false,
        coinReward: 0,
        isMaxLevel: true,
      };
    }

    // Calcular novo XP da temporada
    let newSeasonXp = user.seasonXp + xpAmount;
    let newLevel = user.level;
    let leveledUp = false;
    let coinsRewarded = 0;

    // Verificar se o usuário subiu de nível
    while (newLevel < this.MAX_LEVEL && newSeasonXp >= this.xpRequirements[newLevel]) {
      leveledUp = true;
      newLevel++;
      coinsRewarded += this.levelUpCoins[newLevel];
    }

    // Se atingiu o nível máximo, limitar o XP da temporada
    if (newLevel >= this.MAX_LEVEL && newSeasonXp > this.MAX_XP) {
      newSeasonXp = this.MAX_XP;
    }

    // Atualizar o usuário no banco de dados
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        seasonXp: newSeasonXp,
        totalXp: user.totalXp + xpAmount,
        coins: user.coins + coinsRewarded,
        lastLevelUpAt: leveledUp ? new Date() : user.lastLevelUpAt,
      },
    });

    // Atualizar pontuação no leaderboard
    await this.leaderboardService.addPoints(userId, xpAmount, currentSeason.name);

    return {
      level: updatedUser.level,
      previousXp: user.seasonXp,
      currentXp: updatedUser.seasonXp,
      totalXp: updatedUser.totalXp,
      leveledUp,
      coinReward: coinsRewarded,
      isMaxLevel: updatedUser.level >= this.MAX_LEVEL,
    };
  }

  // Obter tabela de recompensas por nível
  async getLevelRewards() {
    const rewards = [];

    for (let i = 1; i <= this.MAX_LEVEL; i++) {
      rewards.push({
        level: i,
        xpRequired: this.xpRequirements[i-1],
        coinsRewarded: this.levelUpCoins[i],
      });
    }

    return rewards;
  }

  // Resetar a temporada (executado automaticamente ou manualmente por admin)
  async resetSeason() {
    // Obter todos os usuários
    const users = await this.prisma.user.findMany();
    
    // Obter a temporada atual
    const currentSeason = await this.getCurrentSeason();
    
    // Marcar a temporada atual como completada
    await this.prisma.season.update({
      where: { id: currentSeason.id },
      data: {
        completed: true,
        isActive: false,
      },
    });
    
    // Obter o ranking global da temporada
    const leaderboard = await this.leaderboardService.getGlobalRanking(currentSeason.name);
    
    // Distribuir recompensas da temporada
    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];
      let coinsRewarded = 0;
      
      // Distribuir recompensas conforme posição
      if (i === 0) {
        coinsRewarded = 2000; // 1º lugar
      } else if (i === 1) {
        coinsRewarded = 1500; // 2º lugar
      } else if (i === 2) {
        coinsRewarded = 1000; // 3º lugar
      } else if (i >= 3 && i <= 9) {
        coinsRewarded = 400; // 4º ao 10º lugar
      } else if (i >= 10 && i <= 99) {
        coinsRewarded = 30; // 11º ao 100º lugar
      }
      
      if (coinsRewarded > 0) {
        // Adicionar moedas ao usuário
        await this.prisma.user.update({
          where: { id: entry.userId },
          data: {
            coins: {
              increment: coinsRewarded,
            },
          },
        });
        
        // Registrar a recompensa da temporada
        await this.prisma.seasonReward.create({
          data: {
            season: { connect: { id: currentSeason.id } },
            user: { connect: { id: entry.userId } },
            rank: i + 1,
            coinsRewarded,
          },
        });
      }
    }
    
    // Criar nova temporada baseada na estação do ano
    const newSeason = await this.createNewSeason();
    
    // Resetar níveis e XP da temporada para todos os usuários
    for (const user of users) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          level: 1,
          seasonXp: 0,
        },
      });
    }
    
    // Marcar a temporada atual como tendo emitido todas as recompensas
    await this.prisma.season.update({
      where: { id: currentSeason.id },
      data: {
        rewardsIssued: true,
      },
    });
    
    return {
      previousSeason: {
        id: currentSeason.id,
        name: currentSeason.name,
        displayName: currentSeason.displayName,
      },
      newSeason: {
        id: newSeason.id,
        name: newSeason.name,
        displayName: newSeason.displayName,
        startDate: newSeason.startDate,
        endDate: newSeason.endDate,
      },
      rewardsDistributed: leaderboard.length,
    };
  }

  // Obter a temporada atual ou criar uma nova se não existir
  async getCurrentSeason() {
    const currentDate = new Date();
    
    // Verificar se existe uma temporada ativa
    const activeSeason = await this.prisma.season.findFirst({
      where: {
        isActive: true,
        startDate: { lte: currentDate },
        endDate: { gte: currentDate },
      },
    });
    
    if (activeSeason) {
      return activeSeason;
    }
    
    // Se não existir temporada ativa, criar uma nova
    return this.createNewSeason();
  }

  // Criar uma nova temporada baseada na estação do ano
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
          data: { isActive: true },
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
        completed: false,
        rewardsIssued: false,
      },
    });
  }
  
  // Obter opções de XP e Coins para desafios
  getChallengeOptions() {
    return {
      xpOptions: this.challengeXpOptions,
      coinsOptions: this.challengeCoinsOptions,
    };
  }
} 