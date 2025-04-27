import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra uma ação administrativa no sistema
   */
  async log(
    adminId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: any,
    ipAddress?: string,
  ) {
    return this.prisma.adminLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
      },
    });
  }

  /**
   * Busca logs com opções de filtragem
   */
  async findLogs(options: {
    adminId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { 
      adminId, 
      action, 
      entityType, 
      entityId, 
      startDate, 
      endDate,
      page = 1, 
      limit = 25 
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      ...(adminId && { adminId }),
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate })
        }
      }
    };

    const [logs, total] = await Promise.all([
      this.prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminLog.count({ where })
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Busca log por ID
   */
  async findLogById(id: string) {
    return this.prisma.adminLog.findUnique({
      where: { id }
    });
  }
} 