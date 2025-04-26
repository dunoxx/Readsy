import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [PrismaModule, LeaderboardModule],
  controllers: [QuestsController, AchievementsController, GamificationController],
  providers: [QuestsService, AchievementsService, GamificationService],
  exports: [QuestsService, AchievementsService, GamificationService],
})
export class GamificationModule {} 