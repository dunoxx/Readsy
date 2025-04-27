import { z } from 'zod';

export const envSchema = z.object({
  // Servidor
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  
  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  
  // API externas
  OPEN_LIBRARY_API_URL: z.string().default('https://openlibrary.org/api'),
  GOOGLE_BOOKS_API_URL: z.string().default('https://www.googleapis.com/books/v1'),
  BOOK_PLACEHOLDER_COVER_URL: z.string().default('https://readsy.app/placeholder-cover.jpg'),
  
  // Posts e Timeline
  POST_MAX_PER_PAGE: z.coerce.number().default(50),
  POST_RATE_LIMIT: z.coerce.number().default(3),
  POST_RATE_LIMIT_WINDOW: z.coerce.number().default(30),
  
  // Gamificação
  GAMIFICATION_MAX_LEVEL: z.coerce.number().default(10),
  GAMIFICATION_MAX_XP: z.coerce.number().default(5500),
  GAMIFICATION_BASE_XP_PER_CHECKIN: z.coerce.number().default(10),
  GAMIFICATION_XP_PER_PAGE: z.coerce.number().default(1),
  GAMIFICATION_XP_PER_MINUTE: z.coerce.number().default(2)
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  
  if (!result.success) {
    console.error('❌ Validação do .env falhou');
    console.error(
      result.error.errors.map(
        (error) => `${error.path}: ${error.message}`
      )
    );
    throw new Error('Validação do .env falhou');
  }
  
  return result.data;
} 