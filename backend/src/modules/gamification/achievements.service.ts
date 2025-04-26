import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GamificationService } from './gamification.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  // Criar uma nova conquista
  async createAchievement(createAchievementDto: CreateAchievementDto) {
    return this.prisma.achievement.create({
      data: {
        name: createAchievementDto.name,
        description: createAchievementDto.description,
        icon: createAchievementDto.icon,
        goal: createAchievementDto.goal,
        xpReward: createAchievementDto.xpReward,
        coinsReward: createAchievementDto.coinsReward || 0,
        badgeReward: createAchievementDto.badgeReward,
      },
    });
  }

  // Atribuir conquistas a todos os usuários
  async assignAchievementsToAllUsers() {
    const achievements = await this.prisma.achievement.findMany();
    const users = await this.prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
      for (const achievement of achievements) {
        // Verificar se o usuário já tem essa conquista atribuída
        const existingAssignment = await this.prisma.userAchievement.findFirst({
          where: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });

        // Se não tiver, cria um novo registro
        if (!existingAssignment) {
          await this.prisma.userAchievement.create({
            data: {
              userId: user.id,
              achievementId: achievement.id,
              progress: 0,
              completed: false,
            },
          });
        }
      }
    }

    return { message: 'Conquistas atribuídas com sucesso a todos os usuários' };
  }

  // Atribuir conquistas a um novo usuário
  async assignAchievementsToUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const achievements = await this.prisma.achievement.findMany();

    for (const achievement of achievements) {
      // Verificar se o usuário já tem essa conquista atribuída
      const existingAssignment = await this.prisma.userAchievement.findFirst({
        where: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Se não tiver, cria um novo registro
      if (!existingAssignment) {
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: 0,
            completed: false,
          },
        });
      }
    }

    return { message: `Conquistas atribuídas com sucesso ao usuário ${userId}` };
  }

  // Atualizar progresso de uma conquista
  async updateAchievementProgress(userId: string, achievementId: string, incrementValue: number) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se a conquista existe
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException(`Conquista com ID ${achievementId} não encontrada`);
    }

    // Buscar a relação usuário-conquista
    const userAchievement = await this.prisma.userAchievement.findFirst({
      where: {
        userId,
        achievementId,
      },
    });

    if (!userAchievement) {
      throw new NotFoundException(`Conquista não atribuída ao usuário`);
    }

    // Se já completou, não atualiza mais
    if (userAchievement.completed) {
      return userAchievement;
    }

    // Calcular o novo progresso
    const newProgress = userAchievement.progress + incrementValue;
    const completed = newProgress >= achievement.goal;

    // Atualizar o progresso
    const updatedUserAchievement = await this.prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: {
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : null,
      },
      include: {
        achievement: true,
      },
    });

    // Se completou, conceder as recompensas
    if (completed && !userAchievement.completed) {
      // Conceder XP
      await this.gamificationService.addXp(userId, achievement.xpReward);

      // Conceder moedas
      if (achievement.coinsReward > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            coins: { increment: achievement.coinsReward },
          },
        });
      }

      // Conceder badge, se houver
      if (achievement.badgeReward) {
        const existingBadge = await this.prisma.userBadge.findFirst({
          where: {
            userId,
            badgeId: achievement.badgeReward,
          },
        });

        if (!existingBadge) {
          await this.prisma.userBadge.create({
            data: {
              userId,
              badgeId: achievement.badgeReward,
            },
          });
        }
      }
    }

    return updatedUserAchievement;
  }

  // Verificar conquistas relacionadas à leitura
  async checkReadingAchievements(userId: string, pagesRead: number) {
    // Buscar conquistas relacionadas à leitura
    const readingAchievements = await this.prisma.achievement.findMany({
      where: {
        name: {
          contains: 'páginas',
        },
      },
    });

    // Atualizar o progresso de cada conquista
    for (const achievement of readingAchievements) {
      await this.updateAchievementProgress(userId, achievement.id, pagesRead);
    }
  }

  // Verificar conquistas relacionadas a check-ins
  async checkCheckinAchievements(userId: string) {
    // Buscar conquistas relacionadas a check-ins
    const checkinAchievements = await this.prisma.achievement.findMany({
      where: {
        name: {
          contains: 'check-in',
        },
      },
    });

    // Atualizar o progresso de cada conquista
    for (const achievement of checkinAchievements) {
      await this.updateAchievementProgress(userId, achievement.id, 1);
    }
  }

  // Verificar conquistas relacionadas a desafios
  async checkChallengeAchievements(userId: string) {
    // Buscar conquistas relacionadas a desafios
    const challengeAchievements = await this.prisma.achievement.findMany({
      where: {
        name: {
          contains: 'desafio',
        },
      },
    });

    // Atualizar o progresso de cada conquista
    for (const achievement of challengeAchievements) {
      await this.updateAchievementProgress(userId, achievement.id, 1);
    }
  }

  // Obter todas as conquistas
  async getAllAchievements() {
    return this.prisma.achievement.findMany();
  }

  // Obter conquistas de um usuário
  async getUserAchievements(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.userAchievement.findMany({
      where: {
        userId,
      },
      include: {
        achievement: true,
      },
    });
  }
} 