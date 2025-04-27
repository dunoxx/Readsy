import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminSettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todas as configurações do sistema
   */
  async findAll(category?: string) {
    const where = category ? { category } : {};
    
    return this.prisma.adminSetting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });
  }

  /**
   * Busca uma configuração específica pelo id
   */
  async findById(id: string) {
    const setting = await this.prisma.adminSetting.findUnique({
      where: { id },
    });
    
    if (!setting) {
      throw new NotFoundException(`Configuração com ID ${id} não encontrada`);
    }
    
    return setting;
  }

  /**
   * Busca uma configuração específica pela chave
   */
  async findByKey(key: string) {
    const setting = await this.prisma.adminSetting.findUnique({
      where: { key },
    });
    
    if (!setting) {
      throw new NotFoundException(`Configuração com chave ${key} não encontrada`);
    }
    
    return setting;
  }

  /**
   * Cria ou atualiza uma configuração
   */
  async upsert(key: string, value: any, description?: string, category: string = 'general') {
    return this.prisma.adminSetting.upsert({
      where: { key },
      update: {
        value,
        description,
        category,
        updatedAt: new Date(),
      },
      create: {
        key,
        value,
        description,
        category,
      },
    });
  }

  /**
   * Remove uma configuração
   */
  async remove(key: string) {
    const setting = await this.prisma.adminSetting.findUnique({
      where: { key },
    });
    
    if (!setting) {
      throw new NotFoundException(`Configuração com chave ${key} não encontrada`);
    }
    
    await this.prisma.adminSetting.delete({
      where: { key },
    });
    
    return { message: 'Configuração removida com sucesso' };
  }

  /**
   * Inicializa configurações padrão do sistema
   */
  async initializeDefaultSettings() {
    const defaultSettings = [
      {
        key: 'season.maxXp',
        value: 10000,
        description: 'XP máximo que um usuário pode ganhar por temporada',
        category: 'season',
      },
      {
        key: 'season.maxCoins',
        value: 1000,
        description: 'Coins máximos que um usuário pode ganhar por temporada',
        category: 'season',
      },
      {
        key: 'dailyQuests.perUser',
        value: 5,
        description: 'Número de missões diárias por usuário',
        category: 'quests',
      },
      {
        key: 'weeklyQuests.perUser',
        value: 10,
        description: 'Número de missões semanais por usuário',
        category: 'quests',
      },
      {
        key: 'app.defaultLanguage',
        value: 'pt',
        description: 'Idioma padrão do sistema',
        category: 'locale',
      },
    ];

    for (const setting of defaultSettings) {
      await this.upsert(
        setting.key, 
        setting.value, 
        setting.description, 
        setting.category
      );
    }

    return { message: 'Configurações padrão inicializadas com sucesso' };
  }
} 