import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
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
    return Promise.all([
      this.userGroup.deleteMany(),
      this.userChallenge.deleteMany(),
      this.challengeBook.deleteMany(),
      this.userBook.deleteMany(),
      this.checkin.deleteMany(),
      this.group.deleteMany(),
      this.challenge.deleteMany(),
      this.book.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
} 