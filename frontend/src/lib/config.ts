/**
 * Configurações do frontend centralizadas para facilitar a manutenção.
 * Todas as variáveis de ambiente do frontend devem ser acessadas através deste arquivo.
 */

export const config = {
  /**
   * Ambiente da aplicação
   */
  environment: {
    /**
     * Ambiente atual (development, production, test)
     */
    nodeEnv: process.env.NODE_ENV || 'development',
    
    /**
     * Verifica se o ambiente é de produção
     */
    isProduction: process.env.NODE_ENV === 'production',
    
    /**
     * Verifica se o ambiente é de desenvolvimento
     */
    isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  },
  
  /**
   * API e endpoints
   */
  api: {
    /**
     * URL base da API (incluindo o prefixo /api)
     */
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    
    /**
     * Timeout para requisições em milissegundos
     */
    timeout: 15000,
  },
  
  /**
   * Autenticação
   */
  auth: {
    /**
     * Client ID para autenticação com Google
     */
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },
  
  /**
   * Configurações de i18n
   */
  i18n: {
    /**
     * Locale padrão da aplicação
     */
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'pt',
    
    /**
     * Locales suportados pela aplicação
     */
    supportedLocales: ['pt', 'en', 'es'],
  },
  
  /**
   * Análise e Monitoramento (opcional)
   */
  analytics: {
    /**
     * ID do Google Analytics (opcional)
     */
    analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    
    /**
     * DSN do Sentry para monitoramento de erros (opcional)
     */
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  },
};

/**
 * Exporta o objeto config como padrão
 */
export default config; 