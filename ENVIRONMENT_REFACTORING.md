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

No AppModule:

```typescript
// backend/src/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: envValidationSchema,
  validationOptions: {
    abortEarly: true,
  },
}),
```

### 2. Configurações de JWT e Autenticação

Todas as configurações relacionadas a JWT e autenticação agora são lidas a partir de variáveis de ambiente:

```typescript
// backend/src/modules/auth/auth.module.ts
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    },
  }),
}),
```

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
try {
  // ...  
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const isProduction = nodeEnv === 'production';

  // Swagger apenas em desenvolvimento
  if (!isProduction) {
    // ... configuração do Swagger ...
  }
  // ...
} catch (error) {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
}
```

### 6. Correções de Tipagem

Foram corrigidos problemas de tipagem no código para garantir o funcionamento correto da aplicação:

```typescript
// backend/src/modules/auth/auth.service.ts
const tokens = await this.getTokens(
  user.id,
  user.email,
  user.username || undefined
);
```

```typescript
// backend/src/prisma/prisma.service.ts
async cleanDatabase() {
  // ...
  const models = [
    'userGroup',
    'userChallenge',
    // ...
  ];

  return Promise.all(
    models.map((modelName) => {
      // @ts-ignore - Ignora o aviso de tipo, pois estamos acessando dinamicamente
      return this[modelName].deleteMany();
    })
  );
}
```

## Frontend (Next.js)

### 1. Arquivo de Configuração Centralizado

Criamos um arquivo de configuração centralizado para o frontend, permitindo o acesso organizado a todas as variáveis de ambiente:

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

export default config;
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

Foram criados templates para os arquivos `.env.sample` do backend e frontend. Os templates estão disponíveis no arquivo `ENV_FILES_TEMPLATES.md`.

## Próximos Passos

1. Criar fisicamente os arquivos `.env.sample` nos diretórios correspondentes usando os templates fornecidos.
2. Atualizar os arquivos `.env` de desenvolvimento com valores reais para teste.
3. Verificar se a aplicação inicia corretamente com as novas configurações.
4. Atualizar a documentação do projeto para orientar novos desenvolvedores sobre as variáveis de ambiente necessárias.

## Conclusão

Esta refatoração garantiu que:

1. Nenhuma informação sensível esteja hardcoded no código
2. Todas as configurações críticas sejam lidas do .env via ConfigService (backend) ou process.env (frontend)
3. A aplicação tenha segurança, escalabilidade e facilidade de manutenção melhoradas
4. A aplicação falhe de forma segura se estiverem faltando variáveis críticas

A validação com Joi também assegura que a aplicação não inicie sem as variáveis de ambiente necessárias, fornecendo mensagens de erro claras sobre quais variáveis estão faltando. 