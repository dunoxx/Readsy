import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestType } from './dto/quest-type.enum';

@Injectable()
export class QuestValidatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida se o usuário cumpriu os requisitos de uma quest
   */
  async validateQuestCompletion(userId: string, questType: QuestType, parameters: Record<string, any> = {}): Promise<boolean> {
    switch (questType) {
      case QuestType.CHECKIN_DAY:
        return this.validateCheckinDay(userId);
      
      case QuestType.READ_PAGES:
        return this.validateReadPages(userId, parameters.pages || 0);
      
      case QuestType.FINISH_BOOK:
        return this.validateFinishBook(userId, parameters.count || 1);
      
      case QuestType.POST_TIMELINE:
        return this.validatePostTimeline(userId, parameters.count || 1);
      
      case QuestType.JOIN_GROUP_CHALLENGE:
        return this.validateJoinGroupChallenge(userId);
      
      case QuestType.REACT_TO_POST:
        return this.validateReactToPost(userId, parameters.count || 1);
      
      case QuestType.UPDATE_BOOK_STATUS:
        return this.validateUpdateBookStatus(userId);
      
      case QuestType.INVITE_FRIEND:
        return this.validateInviteFriend(userId, parameters.count || 1);
      
      case QuestType.CREATE_GROUP:
        return this.validateCreateGroup(userId);
      
      case QuestType.COMPLETE_DAILY_QUESTS:
        return this.validateCompleteDailyQuests(userId, parameters.count || 3);
      
      default:
        return false;
    }
  }

  /**
   * Valida se o usuário fez check-in hoje
   */
  private async validateCheckinDay(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkins = await this.prisma.checkin.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    return checkins.length > 0;
  }

  /**
   * Valida se o usuário leu o número de páginas necessário
   */
  private async validateReadPages(userId: string, pageGoal: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await this.prisma.checkin.aggregate({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        pagesRead: true,
      },
    });
    
    return (result._sum.pagesRead || 0) >= pageGoal;
  }

  /**
   * Valida se o usuário finalizou ao menos um livro
   */
  private async validateFinishBook(userId: string, count: number): Promise<boolean> {
    // Lógica para verificar se o usuário finalizou livros
    // Implementação depende de como os livros são marcados como finalizados
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const finishedBooks = await this.prisma.book.count({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: {
          gte: weekAgo,
        },
      },
    });
    
    return finishedBooks >= count;
  }

  /**
   * Valida se o usuário postou na timeline
   */
  private async validatePostTimeline(userId: string, count: number): Promise<boolean> {
    // Esta funcionalidade pode ainda não existir
    // Implementação futura quando o sistema de timeline for criado
    return true; // Mock para desenvolvimento
  }

  /**
   * Valida se o usuário entrou em um desafio de grupo
   */
  private async validateJoinGroupChallenge(userId: string): Promise<boolean> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const joinedChallenges = await this.prisma.userGroupChallenge.count({
      where: {
        userId,
        createdAt: {
          gte: weekAgo,
        },
      },
    });
    
    return joinedChallenges > 0;
  }

  /**
   * Valida se o usuário reagiu a posts
   */
  private async validateReactToPost(userId: string, count: number): Promise<boolean> {
    // Esta funcionalidade pode ainda não existir
    // Implementação futura quando o sistema de reações for criado
    return true; // Mock para desenvolvimento
  }

  /**
   * Valida se o usuário atualizou o status de um livro
   */
  private async validateUpdateBookStatus(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const updatedBooks = await this.prisma.book.count({
      where: {
        userId,
        updatedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    return updatedBooks > 0;
  }

  /**
   * Valida se o usuário convidou amigos
   */
  private async validateInviteFriend(userId: string, count: number): Promise<boolean> {
    // Esta funcionalidade pode ainda não existir
    // Implementação futura quando o sistema de convites for criado
    return true; // Mock para desenvolvimento
  }

  /**
   * Valida se o usuário criou um grupo
   */
  private async validateCreateGroup(userId: string): Promise<boolean> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const createdGroups = await this.prisma.group.count({
      where: {
        ownerId: userId,
        createdAt: {
          gte: weekAgo,
        },
      },
    });
    
    return createdGroups > 0;
  }

  /**
   * Valida se o usuário completou um número de quests diárias
   */
  private async validateCompleteDailyQuests(userId: string, count: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const completedQuests = await this.prisma.userDailyQuest.count({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    return completedQuests >= count;
  }
} 