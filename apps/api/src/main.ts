import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Adicionar pipe de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Middleware para log de requisições
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  });

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   - POST /api/v1/auth/register`);
  console.log(`   - POST /api/v1/auth/login`);
  console.log(`   - POST /api/v1/auth/refresh`);
  console.log(`   - GET  /api/v1/users/me`);
  console.log(`   - GET  /api/v1/shelves`);
  console.log(`   - POST /api/v1/shelves`);
  console.log(`   - GET  /api/v1/shelves/:id`);
  console.log(`   - PATCH /api/v1/shelves/:id`);
  console.log(`   - DELETE /api/v1/shelves/:id`);
  console.log(`   - GET  /api/v1/shelves/:id/books`);
}
bootstrap(); 