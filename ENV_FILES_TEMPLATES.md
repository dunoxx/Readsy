# Templates para Arquivos .env

Este documento contém os templates recomendados para os arquivos `.env` e `.env.sample` do projeto Readsy, tanto para o backend quanto para o frontend. Copie esses conteúdos para os respectivos arquivos.

## Backend (.env.sample)

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
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Frontend (.env.sample)

```
# Ambiente
NODE_ENV=development

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# APIs de Livros (caso precise no frontend)
NEXT_PUBLIC_OPEN_LIBRARY_API_URL=https://openlibrary.org
NEXT_PUBLIC_GOOGLE_BOOKS_API_URL=https://www.googleapis.com/books/v1

# Análise e Monitoramento (opcional)
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Configurações de i18n
NEXT_PUBLIC_DEFAULT_LOCALE=pt
```

## Instruções de Uso

1. Copie o conteúdo do template correspondente para criar os arquivos:
   - `backend/.env.sample`
   - `frontend/.env.sample`

2. Para ambientes de desenvolvimento, crie cópias desses arquivos chamadas `.env` e preencha com os valores adequados.

3. Para ambiente de produção, certifique-se de trocar os valores fictícios por valores reais, especialmente para segredos e chaves de API.

4. Nunca comite os arquivos `.env` contendo valores reais para o repositório - apenas os arquivos `.env.sample`. 