import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Obter configurações do ambiente
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // Configuração global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Middlewares
  app.use(cookieParser());
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Prefixo global para APIs
  app.setGlobalPrefix('api');

  // Swagger (apenas em ambiente não-produção)
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Readsy API')
      .setDescription('API para a plataforma Readsy')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`Servidor rodando na porta ${port} em modo ${nodeEnv}`);
  console.log(`Frontend URL: ${frontendUrl}`);
  
  // Log de aviso se estiver rodando em produção sem https
  if (isProduction && !frontendUrl.startsWith('https')) {
    console.warn('⚠️ ATENÇÃO: Aplicação em produção sem HTTPS configurado no FRONTEND_URL');
  }
}

bootstrap(); 