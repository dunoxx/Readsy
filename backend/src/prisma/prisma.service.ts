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

    // Lista de modelos para limpar (em ordem para evitar problemas de chave estrangeira)
    const models = [
      'userGroup',
      'userChallenge',
      'challengeBook',
      'userBook',
      'checkin',
      'group',
      'challenge',
      'book',
      'user',
    ];

    // Limpar os dados de cada modelo
    return Promise.all(
      models.map((modelName) => {
        // @ts-ignore - Ignora o aviso de tipo, pois estamos acessando dinamicamente
        return this[modelName].deleteMany();
      })
    );
  }
} 