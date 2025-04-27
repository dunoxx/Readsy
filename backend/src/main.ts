import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    // Obter variáveis de ambiente
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const port = configService.get<number>('PORT', 3001);
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const isProduction = nodeEnv === 'production';

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

    // Swagger - apenas em ambiente de desenvolvimento ou testes
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
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap(); 