# Refatoração de Variáveis de Ambiente no Readsy

Este documento detalha a refatoração de variáveis de ambiente realizada no projeto Readsy para garantir que nenhuma informação sensível ou configurável esteja hardcoded no código, tornando a aplicação mais segura, escalável e de fácil manutenção.

## Backend (NestJS)

### 1. Validação de Variáveis de Ambiente com Joi

Foi implementada a validação de variáveis de ambiente usando Joi, garantindo que todas as variáveis necessárias estejam presentes e com os valores corretos.

- Arquivo criado: `backend/src/config/env.validation.ts`
- Validação aplicada no `AppModule` para garantir que o backend não inicie sem as variáveis obrigatórias

```typescript
// backend/src/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Ambiente
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number().default(3001),
  
  // ... outras variáveis ...
});
```

### 2. Configurações de JWT e Autenticação

Todas as configurações relacionadas a JWT e autenticação agora são lidas a partir de variáveis de ambiente:

- Expiração de tokens JWT Access e Refresh
- Segredos para assinatura de tokens
- Configurações do Google OAuth

```typescript
// backend/src/modules/auth/auth.service.ts
async getTokens(userId: string, email: string, username?: string): Promise<Tokens> {
  // ...
  
  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    }),
    this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    }),
  ]);
  
  // ...
}
```

### 3. Conexão com Banco de Dados

A configuração de conexão com o banco de dados agora utiliza o `DATABASE_URL` do ConfigService:

```typescript
// backend/src/prisma/prisma.service.ts
constructor(private configService: ConfigService) {
  super({
    datasources: {
      db: {
        url: configService.get<string>('DATABASE_URL'),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
}
```

### 4. APIs Externas de Livros

As URLs das APIs externas de livros agora são lidas a partir de variáveis de ambiente:

```typescript
// backend/src/modules/book/services/external-book.service.ts
constructor(private configService: ConfigService) {
  // Obter URLs das APIs de fontes externas do arquivo .env
  const openLibraryBaseUrl = this.configService.get<string>('OPEN_LIBRARY_API_URL', 'https://openlibrary.org');
  this.openLibraryUrl = `${openLibraryBaseUrl}/api/books`;
  this.openLibrarySearchUrl = `${openLibraryBaseUrl}/search.json`;
  
  this.googleBooksUrl = `${this.configService.get<string>('GOOGLE_BOOKS_API_URL', 'https://www.googleapis.com/books/v1')}/volumes`;
}
```

### 5. Melhoria no Arquivo main.ts

O arquivo `main.ts` foi melhorado para usar variáveis de ambiente e incluir tratamento de erros:

```typescript
// backend/src/main.ts
const nodeEnv = configService.get<string>('NODE_ENV', 'development');
const port = configService.get<number>('PORT', 3001);
const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
const isProduction = nodeEnv === 'production';

// Swagger apenas em desenvolvimento
if (!isProduction) {
  // ... configuração do Swagger ...
}
```

## Frontend (Next.js)

### 1. Arquivo de Configuração Centralizado

Criamos um arquivo de configuração centralizado para o frontend, permitindo o acesso organizado a todas as variáveis de ambiente:

- Arquivo criado: `frontend/src/lib/config.ts`

```typescript
// frontend/src/lib/config.ts
export const config = {
  environment: {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 15000,
  },
  // ... outras configurações ...
};
```

### 2. Atualização do Auth Store

O auth-store foi atualizado para utilizar o arquivo de configuração centralizado:

```typescript
// frontend/src/store/auth-store.ts
import config from '@/lib/config';

// ...

const API_URL = config.api.baseUrl;
```

## Arquivos .env.sample

Foram definidos modelos para os arquivos `.env.sample` do backend e frontend, que podem ser criados manualmente ou pelo CI:

### Backend (.env.sample)

```
# Ambiente
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/readsy

# Redis
REDIS_URL=redis://redis:6379
REDIS_TTL=3600

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# APIs de Livros
OPEN_LIBRARY_API_URL=https://openlibrary.org
GOOGLE_BOOKS_API_URL=https://www.googleapis.com/books/v1

# Stripe (opcional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Frontend (.env.sample)

```
# Ambiente
NODE_ENV=development

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Análise e Monitoramento (opcional)
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Configurações de i18n
NEXT_PUBLIC_DEFAULT_LOCALE=pt
```

## Conclusão

Esta refatoração garantiu que:

1. Nenhuma informação sensível esteja hardcoded no código
2. Todas as configurações críticas sejam lidas do .env via ConfigService (backend) ou process.env (frontend)
3. Exista um modelo de .env.sample para fácil configuração de novos ambientes
4. A aplicação tenha segurança, escalabilidade e facilidade de manutenção melhoradas

A validação com Joi também assegura que a aplicação não inicie sem as variáveis de ambiente necessárias, fornecendo mensagens de erro claras sobre quais variáveis estão faltando. 