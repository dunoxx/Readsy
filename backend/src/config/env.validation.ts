import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Ambiente
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number().default(3001),
  
  // Frontend URL para CORS
  FRONTEND_URL: Joi.string()
    .uri()
    .default('http://localhost:3000'),
  
  // Banco de Dados
  DATABASE_URL: Joi.string().required(),
  
  // Redis
  REDIS_URL: Joi.string().required(),
  REDIS_TTL: Joi.number().default(3600),
  
  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string()
    .uri()
    .required(),
  
  // APIs de Livros
  OPEN_LIBRARY_API_URL: Joi.string()
    .uri()
    .default('https://openlibrary.org'),
  GOOGLE_BOOKS_API_URL: Joi.string()
    .uri()
    .default('https://www.googleapis.com/books/v1'),
  
  // Stripe (opcional, se implementado)
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
}); 