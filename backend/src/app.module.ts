import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookModule } from './modules/book/book.module';
import { GroupModule } from './modules/group/group.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { PostModule } from './modules/post/post.module';
import { StatsModule } from './modules/stats/stats.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    
    // Módulo do Prisma (conexão com banco de dados)
    PrismaModule,
    
    // Módulos da aplicação
    UserModule,
    AuthModule,
    BookModule,
    GroupModule,
    CheckinModule,
    ChallengeModule,
    LeaderboardModule,
    AdminModule,
    GamificationModule,
    PostModule,
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 