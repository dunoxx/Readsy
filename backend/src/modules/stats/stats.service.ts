import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtém as estatísticas pessoais do usuário
   */
  async getUserStats(userId: string) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Contagem total de livros cadastrados pelo usuário
    const totalBooks = await this.prisma.book.count({
      where: {
        createdById: userId,
      },
    });

    // Contagem de livros finalizados - usando string ao invés da enum diretamente
    const finishedBooks = await this.prisma.book.count({
      where: {
        createdById: userId,
        status: 'FINISHED', // String literal é aceito pelo Prisma
      },
    });

    // Contagem total de check-ins
    const totalCheckins = await this.prisma.checkin.count({
      where: {
        userId,
      },
    });

    // Soma de páginas lidas
    const pagesReadResult = await this.prisma.checkin.aggregate({
      where: {
        userId,
      },
      _sum: {
        pagesRead: true,
      },
    });

    // Soma de tempo de leitura (em minutos)
    const readingTimeResult = await this.prisma.checkin.aggregate({
      where: {
        userId,
      },
      _sum: {
        minutesSpent: true,
      },
    });

    // Verificar se as entidades Post e Reaction existem
    let totalPosts = 0;
    let totalReactions = 0;

    try {
      // Estas consultas podem falhar se os modelos ainda não existirem
      const postsResult = await this.prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*)::bigint as count FROM posts WHERE "userId" = ${userId}
      `;
      
      const reactionsResult = await this.prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*)::bigint as count FROM reactions WHERE "userId" = ${userId}
      `;
      
      // Converter resultados de consultas raw para números
      totalPosts = postsResult && postsResult.length > 0 ? Number(postsResult[0].count) : 0;
      totalReactions = reactionsResult && reactionsResult.length > 0 ? Number(reactionsResult[0].count) : 0;
    } catch (error) {
      console.log('Entidades Post ou Reaction podem não existir ainda:', error.message);
    }

    return {
      books: {
        total: totalBooks,
        finished: finishedBooks,
      },
      checkins: {
        total: totalCheckins,
      },
      reading: {
        pagesRead: pagesReadResult._sum.pagesRead || 0,
        minutesSpent: readingTimeResult._sum.minutesSpent || 0,
        hoursSpent: Math.floor((readingTimeResult._sum.minutesSpent || 0) / 60),
      },
      social: {
        posts: totalPosts,
        reactions: totalReactions,
      },
    };
  }

  /**
   * Obtém estatísticas globais da plataforma (para admin)
   */
  async getGlobalStats() {
    // Contagem total de usuários
    const totalUsers = await this.prisma.user.count();

    // Contagem total de grupos
    const totalGroups = await this.prisma.group.count();

    // Contagem total de livros
    const totalBooks = await this.prisma.book.count();

    // Contagem total de check-ins
    const totalCheckins = await this.prisma.checkin.count();

    // Verificar se as entidades Post e Reaction existem
    let totalPosts = 0;
    let totalReactions = 0;

    try {
      // Estas consultas podem falhar se os modelos ainda não existirem
      const postsResult = await this.prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*)::bigint as count FROM posts
      `;
      
      const reactionsResult = await this.prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*)::bigint as count FROM reactions
      `;
      
      // Converter resultados de consultas raw para números
      totalPosts = postsResult && postsResult.length > 0 ? Number(postsResult[0].count) : 0;
      totalReactions = reactionsResult && reactionsResult.length > 0 ? Number(reactionsResult[0].count) : 0;
    } catch (error) {
      console.log('Entidades Post ou Reaction podem não existir ainda:', error.message);
    }

    // Estatísticas de leitura
    const readingStats = await this.prisma.checkin.aggregate({
      _sum: {
        pagesRead: true,
        minutesSpent: true,
      },
    });

    // Calcular o tempo médio de leitura por checkin (em minutos)
    const avgReadingTime = totalCheckins > 0 
      ? (readingStats._sum.minutesSpent || 0) / totalCheckins 
      : 0;

    // Estatísticas de livros por status
    const booksByStatus = {
      READING: 0,
      FINISHED: 0,
      ABANDONED: 0,
      PLANNING: 0
    };

    // Buscar contagem para cada status individualmente usando strings
    const readingBooks = await this.prisma.book.count({ where: { status: 'READING' } });
    const finishedBooks = await this.prisma.book.count({ where: { status: 'FINISHED' } });
    const abandonedBooks = await this.prisma.book.count({ where: { status: 'ABANDONED' } });
    const planningBooks = await this.prisma.book.count({ where: { status: 'PLANNING' } });

    booksByStatus.READING = readingBooks;
    booksByStatus.FINISHED = finishedBooks;
    booksByStatus.ABANDONED = abandonedBooks;
    booksByStatus.PLANNING = planningBooks;

    // Usuários mais ativos (top 5) - baseado em número de check-ins
    const topActiveUsers = await this.prisma.checkin.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5,
    });

    // Buscar detalhes dos usuários mais ativos
    const userIds = topActiveUsers.map(user => user.userId);
    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePicture: true,
      }
    });

    // Mapear detalhes dos usuários com contagem de check-ins
    const topUsers = topActiveUsers.map(activeUser => {
      const user = userDetails.find(u => u.id === activeUser.userId);
      return {
        ...user,
        checkinsCount: activeUser._count?.id || 0
      };
    });

    return {
      users: {
        total: totalUsers,
      },
      groups: {
        total: totalGroups,
      },
      books: {
        total: totalBooks,
        byStatus: booksByStatus,
      },
      checkins: {
        total: totalCheckins,
        totalPagesRead: readingStats._sum.pagesRead || 0,
        totalMinutesSpent: readingStats._sum.minutesSpent || 0,
        totalHoursSpent: Math.floor((readingStats._sum.minutesSpent || 0) / 60),
        avgMinutesPerCheckin: Math.round(avgReadingTime * 10) / 10,
      },
      social: {
        posts: totalPosts,
        reactions: totalReactions,
      },
      topActiveUsers: topUsers,
      // Estas estatísticas serão implementadas quando as entidades estiverem disponíveis
      topGenres: [],
      topPublishers: [],
    };
  }
} 