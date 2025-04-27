import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestType } from './dto/quest-type.enum';
import { BookStatus } from '../../modules/book/dtos/update-book-status.dto';

@Injectable()
export class QuestValidatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida se o usuário cumpriu os requisitos de uma quest
   */
  async validateQuestCompletion(userId: string, questType: QuestType, parameters: Record<string, any> = {}): Promise<boolean> {
    switch (questType) {
      case QuestType.DAILY_CHECKIN:
        return this.validateDailyCheckin(userId);
      
      case QuestType.READ_PAGES:
        return this.validateReadPages(userId, parameters.pages || 0);
      
      case QuestType.COMPLETE_BOOK:
        return this.validateCompleteBook(userId, parameters.count || 1);
      
      case QuestType.JOIN_GROUP:
        return this.validateJoinGroup(userId);
      
      case QuestType.INVITE_FRIEND:
        return this.validateInviteFriend(userId, parameters.count || 1);
      
      case QuestType.REVIEW_BOOK:
        return this.validateReviewBook(userId, parameters.count || 1);
      
      case QuestType.UPDATE_PROFILE:
        return this.validateUpdateProfile(userId);
      
      default:
        return false;
    }
  }

  /**
   * Valida se o usuário fez check-in hoje
   */
  private async validateDailyCheckin(userId: string): Promise<boolean> {
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
  private async validateCompleteBook(userId: string, count: number): Promise<boolean> {
    // Verificar se o usuário finalizou livros definindo o status como FINISHED
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const finishedBooks = await this.prisma.book.count({
      where: {
        createdById: userId,
        status: BookStatus.FINISHED,
        // Usar apenas a data para verificar
        createdAt: {
          gte: weekAgo,
        },
      },
    });
    
    return finishedBooks >= count;
  }

  /**
   * Valida se o usuário entrou em um grupo
   */
  private async validateJoinGroup(userId: string): Promise<boolean> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const joinedGroups = await this.prisma.groupMember.count({
      where: {
        userId,
        joinedAt: {
          gte: weekAgo,
        },
      },
    });
    
    return joinedGroups > 0;
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
   * Valida se o usuário escreveu uma resenha
   */
  private async validateReviewBook(userId: string, count: number): Promise<boolean> {
    // Esta funcionalidade pode ainda não existir
    // Implementação futura quando o sistema de resenhas for criado
    return true; // Mock para desenvolvimento
  }

  /**
   * Valida se o usuário atualizou seu perfil
   */
  private async validateUpdateProfile(userId: string): Promise<boolean> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Verificar se houve atualização do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { updatedAt: true },
    });
    
    if (!user) return false;
    
    return user.updatedAt > weekAgo;
  }
} 