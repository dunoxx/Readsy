import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { QuestService } from '../quest/quest.service';
import { AdminLogService } from './admin-log.service';
import { AdminSettingsService } from './admin-settings.service';
import { I18nService } from './i18n.service';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminLogService,
    AdminSettingsService,
    I18nService,
    DashboardService,
    PrismaService,
    UserService,
    GroupService,
    QuestService,
  ],
  exports: [
    AdminService,
    AdminLogService,
    AdminSettingsService,
    I18nService,
  ],
})
export class AdminModule {} 