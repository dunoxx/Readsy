import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GamificationService } from './gamification.service';
import { CreateDailyQuestDto } from './dto/create-daily-quest.dto';
import { CreateWeeklyQuestDto } from './dto/create-weekly-quest.dto';

@Injectable()
export class QuestsService {
  // Limite de moedas por temporada
  private readonly SEASON_COINS_LIMIT = 1000;
  
  // Quantidade de quests diárias por usuário
  private readonly DAILY_QUESTS_PER_USER = 5;
  
  // Quantidade de quests semanais por usuário
  private readonly WEEKLY_QUESTS_PER_USER = 10;

  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  // Criar uma nova quest diária
  async createDailyQuest(createDailyQuestDto: CreateDailyQuestDto) {
    return this.prisma.dailyQuest.create({
      data: {
        title: createDailyQuestDto.title,
        description: createDailyQuestDto.description,
        emoji: createDailyQuestDto.emoji || '🎯',
        baseXpReward: createDailyQuestDto.baseXpReward,
        baseCoinReward: createDailyQuestDto.baseCoinReward || 0,
      },
    });
  }

  // Criar uma nova quest semanal
  async createWeeklyQuest(createWeeklyQuestDto: CreateWeeklyQuestDto) {
    return this.prisma.weeklyQuest.create({
      data: {
        title: createWeeklyQuestDto.title,
        description: createWeeklyQuestDto.description,
        emoji: createWeeklyQuestDto.emoji || '🎯',
        baseXpReward: createWeeklyQuestDto.baseXpReward,
        baseCoinReward: createWeeklyQuestDto.baseCoinReward || 2,
      },
    });
  }

  // Obter todas as quests diárias ativas
  async getAllDailyQuests() {
    return this.prisma.dailyQuest.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obter todas as quests semanais ativas
  async getAllWeeklyQuests() {
    return this.prisma.weeklyQuest.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Sortear e atribuir quests diárias para um usuário
  async assignDailyQuestsToUser(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Limpar quests diárias expiradas
    await this.clearExpiredDailyQuests(userId);

    // Verificar quests atualmente ativas para o usuário
    const activeQuests = await this.prisma.userDailyQuest.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: { questId: true },
    });

    // Se já tem quests ativas suficientes, retorna
    if (activeQuests.length >= this.DAILY_QUESTS_PER_USER) {
      return this.getUserDailyQuests(userId);
    }

    // Obter IDs das quests que o usuário recentemente completou
    const recentlyCompletedQuestIds = await this.getRecentlyCompletedDailyQuestIds(userId);
    
    // Obter IDs das quests ativas atuais
    const activeQuestIds = activeQuests.map(q => q.questId);
    
    // Obter quests disponíveis (ativas e não recentemente completadas/atribuídas)
    const availableQuests = await this.prisma.dailyQuest.findMany({
      where: {
        isActive: true,
        id: {
          notIn: [...recentlyCompletedQuestIds, ...activeQuestIds],
        },
      },
    });

    // Se não há quests suficientes disponíveis, permitir repetições
    let questsToAssign = availableQuests;
    if (availableQuests.length < (this.DAILY_QUESTS_PER_USER - activeQuests.length)) {
      const allActiveQuests = await this.prisma.dailyQuest.findMany({
        where: {
          isActive: true,
          id: { notIn: activeQuestIds },
        },
      });
      questsToAssign = allActiveQuests;
    }

    // Embaralhar e limitar à quantidade necessária
    const shuffledQuests = this.shuffleArray(questsToAssign)
      .slice(0, this.DAILY_QUESTS_PER_USER - activeQuests.length);

    // Calcular data de expiração (final do dia)
    const expiresAt = this.getEndOfDay();

    // Criar atribuições para o usuário
    const assignments = [];
    for (const quest of shuffledQuests) {
      assignments.push(
        this.prisma.userDailyQuest.create({
          data: {
            user: { connect: { id: userId } },
            quest: { connect: { id: quest.id } },
            expiresAt,
          },
        })
      );
    }

    await Promise.all(assignments);

    // Retornar as quests atribuídas
    return this.getUserDailyQuests(userId);
  }

  // Sortear e atribuir quests semanais para um usuário
  async assignWeeklyQuestsToUser(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Limpar quests semanais expiradas
    await this.clearExpiredWeeklyQuests(userId);

    // Verificar quests atualmente ativas para o usuário
    const activeQuests = await this.prisma.userWeeklyQuest.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: { questId: true },
    });

    // Se já tem quests ativas suficientes, retorna
    if (activeQuests.length >= this.WEEKLY_QUESTS_PER_USER) {
      return this.getUserWeeklyQuests(userId);
    }

    // Obter IDs das quests que o usuário recentemente completou
    const recentlyCompletedQuestIds = await this.getRecentlyCompletedWeeklyQuestIds(userId);
    
    // Obter IDs das quests ativas atuais
    const activeQuestIds = activeQuests.map(q => q.questId);
    
    // Obter quests disponíveis (ativas e não recentemente completadas/atribuídas)
    const availableQuests = await this.prisma.weeklyQuest.findMany({
      where: {
        isActive: true,
        id: {
          notIn: [...recentlyCompletedQuestIds, ...activeQuestIds],
        },
      },
    });

    // Se não há quests suficientes disponíveis, permitir repetições
    let questsToAssign = availableQuests;
    if (availableQuests.length < (this.WEEKLY_QUESTS_PER_USER - activeQuests.length)) {
      const allActiveQuests = await this.prisma.weeklyQuest.findMany({
        where: {
          isActive: true,
          id: { notIn: activeQuestIds },
        },
      });
      questsToAssign = allActiveQuests;
    }

    // Embaralhar e limitar à quantidade necessária
    const shuffledQuests = this.shuffleArray(questsToAssign)
      .slice(0, this.WEEKLY_QUESTS_PER_USER - activeQuests.length);

    // Calcular data de expiração (final da semana)
    const expiresAt = this.getEndOfWeek();

    // Criar atribuições para o usuário
    const assignments = [];
    for (const quest of shuffledQuests) {
      assignments.push(
        this.prisma.userWeeklyQuest.create({
          data: {
            user: { connect: { id: userId } },
            quest: { connect: { id: quest.id } },
            expiresAt,
          },
        })
      );
    }

    await Promise.all(assignments);

    // Retornar as quests atribuídas
    return this.getUserWeeklyQuests(userId);
  }

  // Obter as quests diárias de um usuário
  async getUserDailyQuests(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Limpar quests expiradas
    await this.clearExpiredDailyQuests(userId);

    // Obter quests ativas
    return this.prisma.userDailyQuest.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        quest: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
  }

  // Obter as quests semanais de um usuário
  async getUserWeeklyQuests(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Limpar quests expiradas
    await this.clearExpiredWeeklyQuests(userId);

    // Obter quests ativas
    return this.prisma.userWeeklyQuest.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        quest: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
  }

  // Marcar quest diária como concluída
  async completeDailyQuest(questId: string, userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se a quest está atribuída e ativa para o usuário
    const userQuest = await this.prisma.userDailyQuest.findFirst({
      where: {
        userId,
        questId,
        completed: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException(`Quest diária não encontrada ou já concluída`);
    }

    // Verificar limite de coins da temporada
    const currentSeason = await this.gamificationService.getCurrentSeason();
    const seasonTotalCoins = await this.getSeasonEarnedCoins(userId, currentSeason.name);
    
    // Calcular XP e Coins a serem ganhos
    const xpEarned = userQuest.quest.baseXpReward;
    let coinsEarned = userQuest.quest.baseCoinReward;
    
    // Verificar se ultrapassa o limite de coins da temporada
    if (seasonTotalCoins + coinsEarned > this.SEASON_COINS_LIMIT) {
      // Limitar para não ultrapassar o teto
      coinsEarned = Math.max(0, this.SEASON_COINS_LIMIT - seasonTotalCoins);
    }

    // Marcar quest como concluída
    const completedQuest = await this.prisma.userDailyQuest.update({
      where: { id: userQuest.id },
      data: {
        completed: true,
        completedAt: new Date(),
        xpEarned,
        coinsEarned,
      },
      include: {
        quest: true,
      },
    });

    // Adicionar XP e Coins para o usuário
    await this.gamificationService.addXp(userId, xpEarned);
    
    if (coinsEarned > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: coinsEarned,
          },
        },
      });
    }

    return completedQuest;
  }

  // Marcar quest semanal como concluída
  async completeWeeklyQuest(questId: string, userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se a quest está atribuída e ativa para o usuário
    const userQuest = await this.prisma.userWeeklyQuest.findFirst({
      where: {
        userId,
        questId,
        completed: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException(`Quest semanal não encontrada ou já concluída`);
    }

    // Verificar limite de coins da temporada
    const currentSeason = await this.gamificationService.getCurrentSeason();
    const seasonTotalCoins = await this.getSeasonEarnedCoins(userId, currentSeason.name);
    
    // Calcular XP e Coins a serem ganhos
    const xpEarned = userQuest.quest.baseXpReward;
    let coinsEarned = userQuest.quest.baseCoinReward;
    
    // Verificar se ultrapassa o limite de coins da temporada
    if (seasonTotalCoins + coinsEarned > this.SEASON_COINS_LIMIT) {
      // Limitar para não ultrapassar o teto
      coinsEarned = Math.max(0, this.SEASON_COINS_LIMIT - seasonTotalCoins);
    }

    // Marcar quest como concluída
    const completedQuest = await this.prisma.userWeeklyQuest.update({
      where: { id: userQuest.id },
      data: {
        completed: true,
        completedAt: new Date(),
        xpEarned,
        coinsEarned,
      },
      include: {
        quest: true,
      },
    });

    // Adicionar XP e Coins para o usuário
    await this.gamificationService.addXp(userId, xpEarned);
    
    if (coinsEarned > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: coinsEarned,
          },
        },
      });
    }

    return completedQuest;
  }

  // Forçar reabastecimento de quests diárias para todos usuários (admin)
  async refreshDailyQuestsForAllUsers() {
    // Obter todos os usuários
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    // Limpar quests diárias expiradas para todos
    await this.prisma.userDailyQuest.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { completed: true },
        ],
      },
    });

    // Atribuir novas quests diárias para cada usuário
    const assignments = users.map(user => this.assignDailyQuestsToUser(user.id));
    await Promise.all(assignments);

    return { message: 'Quests diárias atualizadas para todos os usuários' };
  }

  // Forçar reabastecimento de quests semanais para todos usuários (admin)
  async refreshWeeklyQuestsForAllUsers() {
    // Obter todos os usuários
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    // Limpar quests semanais expiradas para todos
    await this.prisma.userWeeklyQuest.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { completed: true },
        ],
      },
    });

    // Atribuir novas quests semanais para cada usuário
    const assignments = users.map(user => this.assignWeeklyQuestsToUser(user.id));
    await Promise.all(assignments);

    return { message: 'Quests semanais atualizadas para todos os usuários' };
  }

  // Limpar quests diárias expiradas para um usuário
  private async clearExpiredDailyQuests(userId: string) {
    await this.prisma.userDailyQuest.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });
  }

  // Limpar quests semanais expiradas para um usuário
  private async clearExpiredWeeklyQuests(userId: string) {
    await this.prisma.userWeeklyQuest.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });
  }

  // Obter IDs de quests diárias recentemente completadas pelo usuário
  private async getRecentlyCompletedDailyQuestIds(userId: string) {
    // Considerar quests concluídas nos últimos 3 dias
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentCompletions = await this.prisma.userDailyQuest.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: threeDaysAgo },
      },
      select: { questId: true },
    });

    return recentCompletions.map(c => c.questId);
  }

  // Obter IDs de quests semanais recentemente completadas pelo usuário
  private async getRecentlyCompletedWeeklyQuestIds(userId: string) {
    // Considerar quests concluídas nas últimas 2 semanas
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentCompletions = await this.prisma.userWeeklyQuest.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: twoWeeksAgo },
      },
      select: { questId: true },
    });

    return recentCompletions.map(c => c.questId);
  }

  // Calcular o final do dia atual
  private getEndOfDay(): Date {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  // Calcular o final da semana atual
  private getEndOfWeek(): Date {
    const endOfWeek = new Date();
    // Obter dia da semana (0 = Domingo, 6 = Sábado)
    const dayOfWeek = endOfWeek.getDay();
    // Adicionar dias para chegar ao fim da semana (Domingo)
    const daysToAdd = 7 - dayOfWeek;
    endOfWeek.setDate(endOfWeek.getDate() + daysToAdd);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  // Embaralhar array (algoritmo Fisher-Yates)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Calcular total de coins já ganhos na temporada
  private async getSeasonEarnedCoins(userId: string, season: string): Promise<number> {
    // Somar coins das quests diárias
    const dailyCoins = await this.prisma.userDailyQuest.aggregate({
      where: {
        userId,
        completed: true,
        completedAt: { not: null },
        // Verificar quests completadas nesta temporada
        quest: {
          isActive: true,
        },
      },
      _sum: {
        coinsEarned: true,
      },
    });

    // Somar coins das quests semanais
    const weeklyCoins = await this.prisma.userWeeklyQuest.aggregate({
      where: {
        userId,
        completed: true,
        completedAt: { not: null },
        // Verificar quests completadas nesta temporada
        quest: {
          isActive: true,
        },
      },
      _sum: {
        coinsEarned: true,
      },
    });

    // Somar coins dos desafios globais
    const challengeCoins = await this.prisma.userGlobalChallenge.aggregate({
      where: {
        userId,
        season,
      },
      _sum: {
        coinsEarned: true,
      },
    });

    // Calcular total
    const total = 
      (dailyCoins._sum.coinsEarned || 0) + 
      (weeklyCoins._sum.coinsEarned || 0) + 
      (challengeCoins._sum.coinsEarned || 0);

    return total;
  }
} 