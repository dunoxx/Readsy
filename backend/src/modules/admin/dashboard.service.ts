import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retorna as estatísticas gerais para o dashboard
   */
  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      totalUsers,
      newUsersToday,
      activeUsers,
      totalGroups,
      activeGroups,
      checkinsToday,
      checkinsThisWeek,
      checkinsThisMonth,
      dailyQuestsCompleted,
      weeklyQuestsCompleted
    ] = await Promise.all([
      // Total de usuários
      this.prisma.user.count(),
      
      // Novos usuários hoje
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: todayStart,
            lt: now,
          },
        },
      }),
      
      // Usuários ativos na última semana
      this.prisma.user.count({
        where: {
          lastCheckInDate: {
            gte: weekStart,
          },
        },
      }),
      
      // Total de grupos
      this.prisma.group.count(),
      
      // Grupos ativos (com alguma atividade na última semana)
      this.prisma.group.count({
        where: {
          members: {
            some: {
              lastActivityAt: {
                gte: weekStart,
              },
            },
          },
        },
      }),
      
      // Checkins hoje
      this.prisma.checkin.count({
        where: {
          createdAt: {
            gte: todayStart,
            lt: now,
          },
        },
      }),
      
      // Checkins nesta semana
      this.prisma.checkin.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: now,
          },
        },
      }),
      
      // Checkins neste mês
      this.prisma.checkin.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: now,
          },
        },
      }),
      
      // Missões diárias completadas hoje
      this.prisma.userDailyQuest.count({
        where: {
          completed: true,
          completedAt: {
            gte: todayStart,
            lt: now,
          },
        },
      }),
      
      // Missões semanais completadas esta semana
      this.prisma.userWeeklyQuest.count({
        where: {
          completed: true,
          completedAt: {
            gte: weekStart,
            lt: now,
          },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        active: activeUsers,
      },
      groups: {
        total: totalGroups,
        active: activeGroups,
      },
      checkins: {
        today: checkinsToday,
        thisWeek: checkinsThisWeek,
        thisMonth: checkinsThisMonth,
      },
      quests: {
        dailyCompletedToday: dailyQuestsCompleted,
        weeklyCompletedThisWeek: weeklyQuestsCompleted,
      },
    };
  }

  /**
   * Obtém dados para o gráfico de novos usuários nos últimos 30 dias
   */
  async getUsersGrowthChart() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    const dailyCounts = {};
    
    // Inicializar contador para cada dia nos últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }
    
    // Contar usuários por dia
    users.forEach(user => {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });
    
    // Converter para array de objetos
    const chartData = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));
    
    return chartData;
  }

  /**
   * Obtém dados para o gráfico de atividade de checkins nos últimos 30 dias
   */
  async getCheckinsActivityChart() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const checkins = await this.prisma.checkin.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        pagesRead: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    const dailyCounts = {};
    const dailyPages = {};
    
    // Inicializar contador para cada dia nos últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
      dailyPages[dateStr] = 0;
    }
    
    // Processar checkins
    checkins.forEach(checkin => {
      const dateStr = checkin.createdAt.toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
        dailyPages[dateStr] += checkin.pagesRead || 0;
      }
    });
    
    // Converter para array de objetos
    const chartData = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      checkins: count,
      pages: dailyPages[date],
    }));
    
    return chartData;
  }
} 