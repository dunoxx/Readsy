import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

@Injectable()
export class I18nService {
  private readonly i18nDir = path.join(process.cwd(), 'src', 'i18n');

  constructor() {
    this.ensureI18nDirExists();
  }

  /**
   * Garante que o diretório de traduções existe
   */
  private async ensureI18nDirExists() {
    try {
      await fsPromises.access(this.i18nDir);
    } catch (error) {
      await fsPromises.mkdir(this.i18nDir, { recursive: true });
    }
  }

  /**
   * Lista todos os idiomas disponíveis
   */
  async getAllLanguages() {
    const files = await fsPromises.readdir(this.i18nDir);
    const languages = files
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        locale: path.basename(file, '.json'),
        file: file,
        path: path.join(this.i18nDir, file)
      }));

    return languages;
  }

  /**
   * Obtém as traduções para um idioma específico
   */
  async getLanguageTranslations(locale: string) {
    const filePath = path.join(this.i18nDir, `${locale}.json`);
    
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new NotFoundException(`Idioma ${locale} não encontrado`);
    }
    
    const content = await fsPromises.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Adiciona ou atualiza um idioma
   */
  async upsertLanguage(locale: string, translations: Record<string, any>) {
    const filePath = path.join(this.i18nDir, `${locale}.json`);
    const content = JSON.stringify(translations, null, 2);
    
    await fsPromises.writeFile(filePath, content, 'utf-8');
    
    return {
      locale,
      filePath,
      message: `Idioma ${locale} salvo com sucesso`
    };
  }

  /**
   * Remove um idioma
   */
  async removeLanguage(locale: string) {
    const filePath = path.join(this.i18nDir, `${locale}.json`);
    
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new NotFoundException(`Idioma ${locale} não encontrado`);
    }
    
    await fsPromises.unlink(filePath);
    
    return {
      locale,
      message: `Idioma ${locale} removido com sucesso`
    };
  }

  /**
   * Exporta um idioma para download
   */
  async exportLanguage(locale: string) {
    const filePath = path.join(this.i18nDir, `${locale}.json`);
    
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      throw new NotFoundException(`Idioma ${locale} não encontrado`);
    }
    
    return {
      locale,
      path: filePath,
      content: await fsPromises.readFile(filePath, 'utf-8')
    };
  }

  /**
   * Importa um idioma a partir de um arquivo
   */
  async importLanguage(locale: string, content: string) {
    try {
      // Verificar se o JSON é válido
      const translations = JSON.parse(content);
      
      return await this.upsertLanguage(locale, translations);
    } catch (error) {
      throw new Error(`Formato de arquivo inválido: ${error.message}`);
    }
  }

  /**
   * Inicializa o sistema com um idioma padrão (pt)
   */
  async initializeDefaultLanguage() {
    const defaultTranslations = {
      "home": {
        "welcome": "Bem-vindo ao Readsy!",
        "description": "Acompanhe suas leituras e conecte-se com outros leitores"
      },
      "login": {
        "email": "Email",
        "password": "Senha",
        "loginButton": "Entrar",
        "forgotPassword": "Esqueceu sua senha?",
        "registerLink": "Criar uma conta"
      },
      "register": {
        "title": "Criar uma conta",
        "email": "Email",
        "password": "Senha",
        "confirmPassword": "Confirmar senha",
        "username": "Nome de usuário",
        "displayName": "Nome de exibição",
        "registerButton": "Registrar",
        "loginLink": "Já tem uma conta? Entre aqui"
      },
      "profile": {
        "editProfile": "Editar perfil",
        "books": "Livros",
        "challenges": "Desafios",
        "achievements": "Conquistas",
        "statistics": "Estatísticas"
      }
    };

    await this.upsertLanguage('pt', defaultTranslations);
    
    return {
      message: 'Idioma padrão (pt) inicializado com sucesso'
    };
  }
} 