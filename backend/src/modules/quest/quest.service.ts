import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestDto } from './dtos/create-quest.dto';
import { UpdateQuestProgressDto } from './dtos/update-quest-progress.dto';
import { QuestValidatorService } from '../gamification/quest-validator.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class QuestService {
  constructor(
    private prisma: PrismaService,
    private questValidator: QuestValidatorService,
    private gamificationService: GamificationService,
  ) {}

  // Criar uma nova quest
  async create(createQuestDto: CreateQuestDto) {
    return this.prisma.quest.create({
      data: {
        title: createQuestDto.title,
        description: createQuestDto.description,
        questType: createQuestDto.questType,
        valueTarget: createQuestDto.valueTarget,
        xpReward: createQuestDto.xpReward,
        coinReward: createQuestDto.coinReward || 0,
        emoji: createQuestDto.emoji || '🎯',
        isDaily: createQuestDto.isDaily ?? true,
        isActive: true,
      },
    });
  }

  // Listar todas as quests ativas
  async findAll() {
    return this.prisma.quest.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Listar todas as quests diárias ativas
  async findAllDaily() {
    return this.prisma.quest.findMany({
      where: {
        isActive: true,
        isDaily: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Listar todas as quests semanais ativas
  async findAllWeekly() {
    return this.prisma.quest.findMany({
      where: {
        isActive: true,
        isDaily: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obter quests aceitas por um usuário
  async findUserQuests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.userQuest.findMany({
      where: {
        userId,
        isCompleted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        quest: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obter quests diárias aceitas por um usuário
  async findUserDailyQuests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.userQuest.findMany({
      where: {
        userId,
        isCompleted: false,
        expiresAt: {
          gt: new Date(),
        },
        quest: {
          isDaily: true,
        },
      },
      include: {
        quest: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obter quests semanais aceitas por um usuário
  async findUserWeeklyQuests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.userQuest.findMany({
      where: {
        userId,
        isCompleted: false,
        expiresAt: {
          gt: new Date(),
        },
        quest: {
          isDaily: false,
        },
      },
      include: {
        quest: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Aceitar uma quest
  async acceptQuest(questId: string, userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se a quest existe e está ativa
    const quest = await this.prisma.quest.findFirst({
      where: {
        id: questId,
        isActive: true,
      },
    });

    if (!quest) {
      throw new NotFoundException(`Quest com ID ${questId} não encontrada ou inativa`);
    }

    // Verificar se o usuário já aceitou esta quest
    const existingUserQuest = await this.prisma.userQuest.findFirst({
      where: {
        userId,
        questId,
        isCompleted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingUserQuest) {
      throw new ConflictException('Você já aceitou esta quest');
    }

    // Calcular a data de expiração com base no tipo da quest
    const expiresAt = quest.isDaily
      ? this.getEndOfDay()
      : this.getEndOfWeek();

    // Criar UserQuest
    return this.prisma.userQuest.create({
      data: {
        userId,
        questId,
        progress: 0,
        isCompleted: false,
        expiresAt,
      },
      include: {
        quest: true,
      },
    });
  }

  // Atualizar o progresso de uma quest
  async updateProgress(userQuestId: string, userId: string, updateQuestProgressDto: UpdateQuestProgressDto) {
    // Verificar se o userQuest existe e pertence ao usuário
    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        id: userQuestId,
        userId,
        isCompleted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException(`Quest não encontrada, já completada ou expirada`);
    }

    // Calcular o novo progresso
    let newProgress = userQuest.progress + updateQuestProgressDto.progressIncrement;
    
    // Verificar se o progresso ultrapassou o alvo
    if (newProgress > userQuest.quest.valueTarget) {
      newProgress = userQuest.quest.valueTarget;
    }

    // Verificar se a quest foi concluída
    const isCompleted = newProgress >= userQuest.quest.valueTarget;
    const completedAt = isCompleted ? new Date() : null;

    // Atualizar o progresso
    const updatedUserQuest = await this.prisma.userQuest.update({
      where: { id: userQuestId },
      data: {
        progress: newProgress,
        isCompleted,
        completedAt,
      },
      include: {
        quest: true,
      },
    });

    // Se a quest foi concluída, conceder as recompensas
    if (isCompleted) {
      // Conceder XP
      await this.gamificationService.addXp(userId, userQuest.quest.xpReward);
      
      // Conceder moedas
      if (userQuest.quest.coinReward > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            coins: {
              increment: userQuest.quest.coinReward,
            },
          },
        });
      }
    }

    return updatedUserQuest;
  }

  // Completar uma quest automaticamente (se já atingiu o progresso necessário)
  async completeQuest(userQuestId: string, userId: string) {
    // Verificar se o userQuest existe e pertence ao usuário
    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        id: userQuestId,
        userId,
        isCompleted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException(`Quest não encontrada, já completada ou expirada`);
    }

    // Validar se o usuário cumpriu os requisitos para completar a quest
    const isCompleted = await this.questValidator.validateQuestCompletion(
      userId,
      userQuest.quest.questType,
      { 
        pages: userQuest.quest.valueTarget,
        count: userQuest.quest.valueTarget 
      }
    );

    if (!isCompleted) {
      throw new BadRequestException('Você ainda não cumpriu os requisitos para completar esta quest');
    }

    // Atualizar a quest como completada
    const completedUserQuest = await this.prisma.userQuest.update({
      where: { id: userQuestId },
      data: {
        progress: userQuest.quest.valueTarget,
        isCompleted: true,
        completedAt: new Date(),
      },
      include: {
        quest: true,
      },
    });

    // Conceder XP
    await this.gamificationService.addXp(userId, userQuest.quest.xpReward);
    
    // Conceder moedas
    if (userQuest.quest.coinReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: userQuest.quest.coinReward,
          },
        },
      });
    }

    return {
      ...completedUserQuest,
      rewards: {
        xp: userQuest.quest.xpReward,
        coins: userQuest.quest.coinReward,
      },
    };
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
} 