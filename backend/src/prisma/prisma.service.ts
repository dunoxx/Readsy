import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Este método não pode ser executado em produção');
    }

    // Define a ordem inversa para evitar problemas de chave estrangeira
    const models = [
      'userGroups',
      'userChallenges',
      'challengeBooks',
      'userBooks',
      'checkins',
      'groups',
      'challenges',
      'books',
      'users',
    ];

    return Promise.all(
      models.map((modelName) => this[modelName].deleteMany()),
    );
  }
} 