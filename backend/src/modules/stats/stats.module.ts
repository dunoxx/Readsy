import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { AdminStatsController } from './admin-stats.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatsController, AdminStatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {} 