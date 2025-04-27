/**
 * Configurações globais do frontend
 * 
 * Centraliza o acesso a variáveis de ambiente usando process.env
 * Todas as variáveis públicas devem começar com NEXT_PUBLIC_
 */

// API e Backend
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Autenticação
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '';

// Uploads
export const UPLOAD_MAX_SIZE = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '5242880'); // 5MB

// Site
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Readsy';
export const SITE_DESCRIPTION = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Sua plataforma de leitura';

// Rotas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  BOOKS: '/books',
  CHALLENGES: '/challenges',
  GROUPS: '/groups',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// Verificação de variáveis críticas
export const checkCriticalEnvVars = (): void => {
  // Em desenvolvimento, alertar sobre variáveis faltantes
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn('⚠️ NEXT_PUBLIC_API_URL não definida, usando valor padrão');
    }
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.warn('⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID não definida, login social pode não funcionar');
    }
  }
}; 