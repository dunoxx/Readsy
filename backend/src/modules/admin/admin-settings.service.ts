import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigCategory } from './dto/config-category.enum';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class AdminSettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todas as configurações do sistema
   */
  async findAll(category?: ConfigCategory) {
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
  async findByKey(key: string, category: ConfigCategory = ConfigCategory.GENERAL) {
    const setting = await this.prisma.adminSetting.findFirst({
      where: { 
        key,
        category
      },
    });
    
    if (!setting) {
      throw new NotFoundException(`Configuração com chave ${key} na categoria ${category} não encontrada`);
    }
    
    return setting;
  }

  /**
   * Busca configurações por categoria
   */
  async findByCategory(category: ConfigCategory) {
    return this.prisma.adminSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Cria uma nova configuração
   */
  async create(createSettingDto: CreateSettingDto) {
    // Verificar se já existe uma configuração com a mesma chave e categoria
    const existingSetting = await this.prisma.adminSetting.findFirst({
      where: {
        key: createSettingDto.key,
        category: createSettingDto.category || ConfigCategory.GENERAL
      }
    });

    if (existingSetting) {
      throw new Error(`Já existe uma configuração com a chave ${createSettingDto.key} na categoria ${createSettingDto.category || ConfigCategory.GENERAL}`);
    }

    return this.prisma.adminSetting.create({
      data: {
        key: createSettingDto.key,
        value: createSettingDto.value,
        description: createSettingDto.description,
        category: createSettingDto.category || ConfigCategory.GENERAL,
      }
    });
  }

  /**
   * Atualiza uma configuração existente
   */
  async update(id: string, updateSettingDto: UpdateSettingDto) {
    // Verificar se a configuração existe
    await this.findById(id);

    return this.prisma.adminSetting.update({
      where: { id },
      data: {
        ...(updateSettingDto.key && { key: updateSettingDto.key }),
        ...(updateSettingDto.value && { value: updateSettingDto.value }),
        ...(updateSettingDto.description !== undefined && { description: updateSettingDto.description }),
        ...(updateSettingDto.category && { category: updateSettingDto.category }),
        updatedAt: new Date(),
      }
    });
  }

  /**
   * Cria ou atualiza uma configuração
   */
  async upsert(key: string, value: any, description?: string, category: ConfigCategory = ConfigCategory.GENERAL) {
    try {
      // Verificar se já existe a configuração
      const existing = await this.findByKey(key, category);
      
      // Se existir, atualiza
      if (existing) {
        return this.prisma.adminSetting.update({
          where: { id: existing.id },
          data: {
            value,
            description,
            updatedAt: new Date(),
          }
        });
      }
    } catch (error) {
      // Se não existir, cria uma nova
      return this.prisma.adminSetting.create({
        data: {
          key,
          value,
          description,
          category,
        }
      });
    }
  }

  /**
   * Remove uma configuração
   */
  async remove(id: string) {
    // Verificar se a configuração existe
    await this.findById(id);
    
    await this.prisma.adminSetting.delete({
      where: { id },
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
        category: ConfigCategory.GAMIFICATION,
      },
      {
        key: 'season.maxCoins',
        value: 1000,
        description: 'Coins máximos que um usuário pode ganhar por temporada',
        category: ConfigCategory.GAMIFICATION,
      },
      {
        key: 'dailyQuests.perUser',
        value: 5,
        description: 'Número de missões diárias por usuário',
        category: ConfigCategory.GAMIFICATION,
      },
      {
        key: 'weeklyQuests.perUser',
        value: 10,
        description: 'Número de missões semanais por usuário',
        category: ConfigCategory.GAMIFICATION,
      },
      {
        key: 'app.defaultLanguage',
        value: 'pt',
        description: 'Idioma padrão do sistema',
        category: ConfigCategory.APP_SETTINGS,
      },
      {
        key: 'app.name',
        value: 'Readsy',
        description: 'Nome da aplicação',
        category: ConfigCategory.APP_SETTINGS,
      },
      {
        key: 'app.description',
        value: 'Plataforma de leitura social e gamificada',
        category: ConfigCategory.APP_SETTINGS,
      },
      {
        key: 'book.api.googleBooks.url',
        value: 'https://www.googleapis.com/books/v1',
        description: 'URL base da API Google Books',
        category: ConfigCategory.BOOK_API_SETTINGS,
      },
      {
        key: 'book.api.openLibrary.url',
        value: 'https://openlibrary.org/api',
        description: 'URL base da API Open Library',
        category: ConfigCategory.BOOK_API_SETTINGS,
      },
      {
        key: 'oauth.google.clientId',
        value: process.env.GOOGLE_CLIENT_ID || '',
        description: 'Client ID para autenticação via Google',
        category: ConfigCategory.THIRD_PARTY,
      }
    ];

    // Criar ou atualizar cada configuração padrão
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