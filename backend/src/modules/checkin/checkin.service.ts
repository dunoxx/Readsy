import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCheckinDto } from './dtos/create-checkin.dto';
import { GamificationService } from '../gamification/gamification.service';
import { AchievementsService } from '../gamification/achievements.service';
import { QuestsService } from '../gamification/quests.service';

@Injectable()
export class CheckinService {
  // Base de XP por check-in
  private readonly BASE_XP_PER_CHECKIN: number;
  
  // XP por página lida
  private readonly XP_PER_PAGE: number;
  
  // XP por minuto de leitura
  private readonly XP_PER_MINUTE: number;

  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private achievementsService: AchievementsService,
    private questsService: QuestsService,
    private configService: ConfigService,
  ) {
    this.BASE_XP_PER_CHECKIN = this.configService.get<number>('GAMIFICATION_BASE_XP_PER_CHECKIN') || 10;
    this.XP_PER_PAGE = this.configService.get<number>('GAMIFICATION_XP_PER_PAGE') || 1;
    this.XP_PER_MINUTE = this.configService.get<number>('GAMIFICATION_XP_PER_MINUTE') || 2;
  }

  // Buscar todos os checkins
  async findAll() {
    return this.prisma.checkin.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Buscar checkins de um usuário específico
  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.checkin.findMany({
      where: {
        userId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Buscar checkin por ID
  async findOne(id: string) {
    const checkin = await this.prisma.checkin.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    if (!checkin) {
      throw new NotFoundException(`Checkin com ID ${id} não encontrado`);
    }

    return checkin;
  }

  // Criar novo checkin
  async create(userId: string, createCheckinDto: CreateCheckinDto) {
    // Verificar se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: createCheckinDto.bookId },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${createCheckinDto.bookId} não encontrado`);
    }

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se páginas lidas não excedem o total do livro (se o livro tiver total de páginas)
    if (book.pages && createCheckinDto.pagesRead > book.pages) {
      throw new BadRequestException(`O número de páginas lidas (${createCheckinDto.pagesRead}) excede o total do livro (${book.pages})`);
    }

    // Verificar se currentPage não excede o total do livro (se o livro tiver total de páginas)
    if (book.pages && createCheckinDto.currentPage && createCheckinDto.currentPage > book.pages) {
      throw new BadRequestException(`A página atual (${createCheckinDto.currentPage}) excede o total do livro (${book.pages})`);
    }

    // Atualizar streak de leitura diária do usuário
    const lastCheckInDate = user.lastCheckInDate;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = user.streak || 0;
    
    // Se o último check-in foi ontem, incrementar streak
    if (lastCheckInDate) {
      const lastCheckIn = new Date(lastCheckInDate);
      // Comparar apenas as datas (sem considerar horário)
      const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (lastDate.getTime() === yesterdayDate.getTime()) {
        // Se o último check-in foi ontem, incrementar streak
        newStreak += 1;
      } else if (lastDate.getTime() < yesterdayDate.getTime()) {
        // Se o último check-in foi antes de ontem, resetar streak
        newStreak = 1;
      } else if (lastDate.getTime() === todayDate.getTime()) {
        // Se já fez check-in hoje, manter streak
        newStreak = user.streak;
      }
    } else {
      // Primeiro check-in
      newStreak = 1;
    }
    
    // Atualizar usuário com novo streak e data do último check-in
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastCheckInDate: today,
      },
    });

    // Criar o checkin
    const checkin = await this.prisma.checkin.create({
      data: {
        user: {
          connect: { id: userId },
        },
        book: {
          connect: { id: createCheckinDto.bookId },
        },
        pagesRead: createCheckinDto.pagesRead,
        minutesSpent: createCheckinDto.minutesSpent,
        currentPage: createCheckinDto.currentPage,
        audioNoteUrl: createCheckinDto.audioNoteUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    // Calcular XP ganho
    const xpForPages = createCheckinDto.pagesRead * this.XP_PER_PAGE;
    const xpForTime = createCheckinDto.minutesSpent * this.XP_PER_MINUTE;
    const totalXp = this.BASE_XP_PER_CHECKIN + xpForPages + xpForTime;

    // Conceder XP ao usuário
    await this.gamificationService.addXp(userId, totalXp);

    // Verificar conquistas relacionadas à leitura
    await this.achievementsService.checkReadingAchievements(userId, createCheckinDto.pagesRead);
    
    // Verificar conquistas relacionadas a check-ins
    await this.achievementsService.checkCheckinAchievements(userId);

    // Verificar se há quests diárias relacionadas a check-ins para completar
    try {
      const dailyQuests = await this.questsService.getUserDailyQuests(userId);
      for (const quest of dailyQuests) {
        if (!quest.completed && quest.quest.title.toLowerCase().includes('check-in')) {
          await this.questsService.completeDailyQuest(quest.questId, userId);
        }
      }
    } catch (error) {
      console.log('Erro ao verificar quests diárias:', error.message);
    }

    // Verificar se há quests semanais relacionadas a check-ins para completar
    try {
      const weeklyQuests = await this.questsService.getUserWeeklyQuests(userId);
      for (const quest of weeklyQuests) {
        if (!quest.completed && quest.quest.title.toLowerCase().includes('check-in')) {
          await this.questsService.completeWeeklyQuest(quest.questId, userId);
        }
      }
    } catch (error) {
      console.log('Erro ao verificar quests semanais:', error.message);
    }

    return {
      ...checkin,
      gamification: {
        xpEarned: totalXp,
        streak: newStreak,
      },
    };
  }

  // Remover checkin
  async remove(id: string) {
    const checkin = await this.prisma.checkin.findUnique({
      where: { id },
    });

    if (!checkin) {
      throw new NotFoundException(`Checkin com ID ${id} não encontrado`);
    }

    await this.prisma.checkin.delete({
      where: { id },
    });

    return { message: 'Checkin removido com sucesso' };
  }
} 