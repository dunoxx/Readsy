import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GamificationService } from './gamification.service';
import { CreateDailyQuestDto } from './dto/create-daily-quest.dto';
import { CreateWeeklyQuestDto } from './dto/create-weekly-quest.dto';
import { QuestType } from './dto/quest-type.enum';
import { QuestValidatorService } from './quest-validator.service';

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
    private questValidator: QuestValidatorService,
  ) {}

  // Criar uma nova quest diária
  async createDailyQuest(createDailyQuestDto: CreateDailyQuestDto) {
    // Validar parâmetros obrigatórios com base no tipo de quest
    this.validateQuestParameters(createDailyQuestDto.questType, createDailyQuestDto.parameters);
    
    return this.prisma.dailyQuest.create({
      data: {
        title: createDailyQuestDto.title,
        description: createDailyQuestDto.description,
        emoji: createDailyQuestDto.emoji || '🎯',
        questType: createDailyQuestDto.questType,
        parameters: createDailyQuestDto.parameters,
        baseXpReward: createDailyQuestDto.baseXpReward,
        baseCoinReward: createDailyQuestDto.baseCoinReward || 0,
      },
    });
  }

  // Criar uma nova quest semanal
  async createWeeklyQuest(createWeeklyQuestDto: CreateWeeklyQuestDto) {
    // Validar parâmetros obrigatórios com base no tipo de quest
    this.validateQuestParameters(createWeeklyQuestDto.questType, createWeeklyQuestDto.parameters);
    
    return this.prisma.weeklyQuest.create({
      data: {
        title: createWeeklyQuestDto.title,
        description: createWeeklyQuestDto.description,
        emoji: createWeeklyQuestDto.emoji || '🎯',
        questType: createWeeklyQuestDto.questType,
        parameters: createWeeklyQuestDto.parameters,
        baseXpReward: createWeeklyQuestDto.baseXpReward,
        baseCoinReward: createWeeklyQuestDto.baseCoinReward || 2,
      },
    });
  }

  // Validar se os parâmetros obrigatórios estão presentes com base no tipo de quest
  private validateQuestParameters(questType: QuestType, parameters: Record<string, any> = {}): void {
    switch (questType) {
      case QuestType.READ_PAGES:
        if (!parameters?.pages || !Number.isInteger(parameters.pages) || parameters.pages <= 0) {
          throw new BadRequestException('O parâmetro "pages" é obrigatório para quests do tipo READ_PAGES e deve ser um número inteiro positivo');
        }
        break;
      
      case QuestType.FINISH_BOOK:
      case QuestType.POST_TIMELINE:
      case QuestType.REACT_TO_POST:
      case QuestType.INVITE_FRIEND:
      case QuestType.COMPLETE_DAILY_QUESTS:
        if (!parameters?.count || !Number.isInteger(parameters.count) || parameters.count <= 0) {
          throw new BadRequestException('O parâmetro "count" é obrigatório para este tipo de quest e deve ser um número inteiro positivo');
        }
        break;
      
      // Tipos que não precisam de parâmetros adicionais
      case QuestType.CHECKIN_DAY:
      case QuestType.JOIN_GROUP_CHALLENGE:
      case QuestType.UPDATE_BOOK_STATUS:
      case QuestType.CREATE_GROUP:
        break;
      
      default:
        throw new BadRequestException(`Tipo de quest "${questType}" não suportado`);
    }
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

  // Completar uma quest diária
  async completeDailyQuest(questId: string, userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se a quest está atribuída ao usuário e não expirou
    const userQuest = await this.prisma.userDailyQuest.findFirst({
      where: {
        userId,
        questId,
        expiresAt: { gt: new Date() },
        completed: false,
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException('Quest não encontrada, já completada ou expirada');
    }

    // Verificar se o usuário completou os requisitos da quest
    const isCompleted = await this.questValidator.validateQuestCompletion(
      userId, 
      userQuest.quest.questType, 
      userQuest.quest.parameters as Record<string, any>
    );

    if (!isCompleted) {
      throw new BadRequestException('Você ainda não completou os requisitos desta quest');
    }

    // Obter limite de moedas por temporada
    const currentSeason = await this.gamificationService.getCurrentSeason();
    const earnedCoins = await this.getSeasonEarnedCoins(userId, currentSeason.name);
    
    // Calcular recompensas
    const xpReward = userQuest.quest.baseXpReward;
    const availableCoins = Math.max(0, this.SEASON_COINS_LIMIT - earnedCoins);
    const coinReward = Math.min(userQuest.quest.baseCoinReward, availableCoins);

    // Atualizar a quest como completada
    const completedQuest = await this.prisma.userDailyQuest.update({
      where: { id: userQuest.id },
      data: {
        completed: true,
        completedAt: new Date(),
        xpEarned: xpReward,
        coinsEarned: coinReward,
      },
      include: {
        quest: true,
      },
    });

    // Conceder XP ao usuário
    await this.gamificationService.addXp(userId, xpReward);
    
    // Conceder moedas ao usuário
    if (coinReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coinReward },
        },
      });
    }

    return {
      ...completedQuest,
      rewards: {
        xp: xpReward,
        coins: coinReward,
      },
    };
  }

  // Completar uma quest semanal
  async completeWeeklyQuest(questId: string, userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se a quest está atribuída ao usuário e não expirou
    const userQuest = await this.prisma.userWeeklyQuest.findFirst({
      where: {
        userId,
        questId,
        expiresAt: { gt: new Date() },
        completed: false,
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException('Quest não encontrada, já completada ou expirada');
    }

    // Verificar se o usuário completou os requisitos da quest
    const isCompleted = await this.questValidator.validateQuestCompletion(
      userId, 
      userQuest.quest.questType, 
      userQuest.quest.parameters as Record<string, any>
    );

    if (!isCompleted) {
      throw new BadRequestException('Você ainda não completou os requisitos desta quest');
    }

    // Obter limite de moedas por temporada
    const currentSeason = await this.gamificationService.getCurrentSeason();
    const earnedCoins = await this.getSeasonEarnedCoins(userId, currentSeason.name);
    
    // Calcular recompensas
    const xpReward = userQuest.quest.baseXpReward;
    const availableCoins = Math.max(0, this.SEASON_COINS_LIMIT - earnedCoins);
    const coinReward = Math.min(userQuest.quest.baseCoinReward, availableCoins);

    // Atualizar a quest como completada
    const completedQuest = await this.prisma.userWeeklyQuest.update({
      where: { id: userQuest.id },
      data: {
        completed: true,
        completedAt: new Date(),
        xpEarned: xpReward,
        coinsEarned: coinReward,
      },
      include: {
        quest: true,
      },
    });

    // Conceder XP ao usuário
    await this.gamificationService.addXp(userId, xpReward);
    
    // Conceder moedas ao usuário
    if (coinReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coinReward },
        },
      });
    }

    return {
      ...completedQuest,
      rewards: {
        xp: xpReward,
        coins: coinReward,
      },
    };
  }

  // Renovar quests diárias para todos os usuários
  async refreshDailyQuestsForAllUsers() {
    // Obter a data atual e limpar quests expiradas
    const now = new Date();
    
    // Remover todas as quests diárias expiradas
    await this.prisma.userDailyQuest.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    
    // Obter todos os usuários ativos
    const users = await this.prisma.user.findMany({
      where: {
        suspended: false,
      },
      select: { id: true },
    });
    
    // Atribuir novas quests para cada usuário
    const assignments = users.map(user => this.assignDailyQuestsToUser(user.id));
    
    await Promise.all(assignments);
    
    return { message: `Quests diárias renovadas para ${users.length} usuários` };
  }

  // Renovar quests semanais para todos os usuários
  async refreshWeeklyQuestsForAllUsers() {
    // Obter a data atual e limpar quests expiradas
    const now = new Date();
    
    // Remover todas as quests semanais expiradas
    await this.prisma.userWeeklyQuest.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    
    // Obter todos os usuários ativos
    const users = await this.prisma.user.findMany({
      where: {
        suspended: false,
      },
      select: { id: true },
    });
    
    // Atribuir novas quests para cada usuário
    const assignments = users.map(user => this.assignWeeklyQuestsToUser(user.id));
    
    await Promise.all(assignments);
    
    return { message: `Quests semanais renovadas para ${users.length} usuários` };
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

  // Obter IDs de quests diárias recentemente completadas por um usuário
  private async getRecentlyCompletedDailyQuestIds(userId: string) {
    // Considerar quests completadas nos últimos 3 dias
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentCompletions = await this.prisma.userDailyQuest.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: threeDaysAgo },
      },
      select: {
        questId: true,
      },
    });
    
    return recentCompletions.map(c => c.questId);
  }

  // Obter IDs de quests semanais recentemente completadas por um usuário
  private async getRecentlyCompletedWeeklyQuestIds(userId: string) {
    // Considerar quests completadas nas últimas 2 semanas
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentCompletions = await this.prisma.userWeeklyQuest.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: twoWeeksAgo },
      },
      select: {
        questId: true,
      },
    });
    
    return recentCompletions.map(c => c.questId);
  }

  // Obter o final do dia atual
  private getEndOfDay(): Date {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }

  // Obter o final da semana atual (domingo)
  private getEndOfWeek(): Date {
    const date = new Date();
    const day = date.getDay();
    // Dias até o próximo domingo
    const daysToSunday = day === 0 ? 7 : 7 - day;
    date.setDate(date.getDate() + daysToSunday);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  // Embaralhar um array
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Obter total de moedas ganhas em uma temporada
  private async getSeasonEarnedCoins(userId: string, season: string): Promise<number> {
    // Somar moedas ganhas em quests diárias
    const dailyCoins = await this.prisma.userDailyQuest.aggregate({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: new Date(season),
        },
      },
      _sum: {
        coinsEarned: true,
      },
    });

    // Somar moedas ganhas em quests semanais
    const weeklyCoins = await this.prisma.userWeeklyQuest.aggregate({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: new Date(season),
        },
      },
      _sum: {
        coinsEarned: true,
      },
    });

    // Retornar o total
    return (dailyCoins._sum.coinsEarned || 0) + (weeklyCoins._sum.coinsEarned || 0);
  }
} 