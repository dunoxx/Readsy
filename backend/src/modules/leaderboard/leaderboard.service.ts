import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  // Obter ranking geral (todos os usuários)
  async getGlobalRanking(season: string = this.getCurrentSeason()) {
    const entries = await this.prisma.leaderboardEntry.findMany({
      where: {
        season,
      },
      orderBy: {
        score: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    return entries;
  }

  // Obter ranking de um usuário específico
  async getUserRanking(userId: string, season: string = this.getCurrentSeason()) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Buscar a entrada do usuário no leaderboard
    const userEntry = await this.prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        season,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!userEntry) {
      return {
        rank: null,
        score: 0,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
        },
        season,
      };
    }

    // Calcular a posição do usuário
    const higherScoreCount = await this.prisma.leaderboardEntry.count({
      where: {
        season,
        score: {
          gt: userEntry.score,
        },
      },
    });

    return {
      rank: higherScoreCount + 1,
      score: userEntry.score,
      user: userEntry.user,
      season,
    };
  }

  // Adicionar pontos para um usuário
  async addPoints(userId: string, points: number, season: string = this.getCurrentSeason()) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Buscar entrada existente ou criar uma nova
    let entry = await this.prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        season,
      },
    });

    if (!entry) {
      // Criar nova entrada
      entry = await this.prisma.leaderboardEntry.create({
        data: {
          user: {
            connect: { id: userId },
          },
          score: points,
          season,
        },
      });
    } else {
      // Atualizar entrada existente
      entry = await this.prisma.leaderboardEntry.update({
        where: { id: entry.id },
        data: {
          score: entry.score + points,
        },
      });
    }

    return entry;
  }

  // Obter temporada atual (pode ser customizado conforme necessário)
  private getCurrentSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    let season: string;
    if (month >= 1 && month <= 3) {
      season = `${year}-Q1`;
    } else if (month >= 4 && month <= 6) {
      season = `${year}-Q2`;
    } else if (month >= 7 && month <= 9) {
      season = `${year}-Q3`;
    } else {
      season = `${year}-Q4`;
    }
    
    return season;
  }
} 