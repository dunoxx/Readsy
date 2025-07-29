# Readsy - Plataforma de Leitura

Monorepo do projeto Readsy com TurboRepo, Next.js, NestJS, TypeScript, ESLint, Prettier, Husky, lint-staged e commitlint.

## 🏗️ Estrutura do Projeto

```
apps/
  - web/     → Next.js (SPA responsivo, PWA-ready, navegação suave, suporte mobile-first)
  - api/     → NestJS (backend modular, DDD, autenticação JWT + OAuth2)
  - admin/   → Next.js (SPA painel administrativo)
libs/
  - ui/      → Componentes React compartilhados (inputs, botões, modais, alerts, etc)
  - types/   → Tipos globais (DTOs, enums, models)
  - utils/   → Funções utilitárias, helpers, validadores
```

## 🎨 Paleta de Cores

- **Primary**: #1E293B
- **Light**: #F9FAFB
- **Blue**: #4F9DDE
- **Green**: #6EE7B7
- **Yellow**: #FCD34D
- **Red**: #EF4444

## 🚀 Comandos

### Desenvolvimento
```bash
# Instalar dependências
pnpm install

# Rodar todos os projetos
pnpm dev

# Rodar projeto específico
pnpm --filter=web dev
pnpm --filter=api dev
```

### Build
```bash
# Build de todos os projetos
pnpm build

# Build específico
pnpm --filter=web build
pnpm --filter=api build
```

### Qualidade de Código
```bash
# Lint e formatação
pnpm lint
pnpm format

# Testes
pnpm test
```

## 🐳 Docker

### Configuração Local
```bash
# Subir serviços (PostgreSQL, Redis, Adminer)
docker-compose up -d

# Parar serviços
docker-compose down

# Limpar volumes (resetar banco)
docker-compose down -v
```

### Acessos:
- **Adminer**: http://localhost:8080
  - Server: postgres
  - Username: readsy
  - Password: readsy
  - Database: readsy_db

## 🔐 Configuração da Autenticação

### Variáveis de Ambiente

#### Backend (`apps/api/.env`)
```env
# Database
DATABASE_URL=postgresql://readsy:readsy@localhost:5432/readsy_db

# JWT
JWT_SECRET=um-segredo-super-seguro
JWT_REFRESH_SECRET=um-refresh-segredo-super-seguro
JWT_EXPIRES_IN=1h

# Redis
REDIS_URL=redis://localhost:6379

# API
API_URL=http://localhost:3333
PORT=3333
NODE_ENV=development

# OAuth2 Google
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3333/api/v1/auth/google/callback
```

#### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Configuração OAuth2 Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API"
4. Vá em "Credenciais" → "Criar credenciais" → "ID do cliente OAuth"
5. Configure:
   - Tipo: Aplicativo da Web
   - URLs de origem autorizadas: `http://localhost:3000`
   - URIs de redirecionamento: `http://localhost:3333/api/v1/auth/google/callback`
6. Copie o Client ID e Client Secret para o `.env`

## 🗄️ Banco de Dados

### Modelos Principais
- **User**: Usuários, perfis, XP, moedas
- **Book**: Livros, metadata, avaliações
- **Shelf**: Estantes pessoais de livros
- **Checkin**: Registro de progresso de leitura
- **Group**: Grupos de leitura
- **Challenge**: Desafios de leitura
- **ShopItem**: Itens da loja (avatars, frames, etc)
- **Country/Language**: Dados geográficos e idiomas

### Migrations e Seeds
```bash
cd apps/api

# Gerar migration
pnpm exec prisma migrate dev

# Reset do banco (desenvolvimento)
pnpm exec prisma migrate reset

# Executar seeds
pnpm exec ts-node prisma/seed.ts

# Visualizar banco
pnpm exec prisma studio
```

## 🌐 API Endpoints

### Autenticação (`/api/v1/auth`)
- `POST /register` - Cadastro por email/senha
- `POST /login` - Login por email/senha
- `POST /refresh` - Renovar token JWT
- `POST /logout` - Logout
- `GET /google` - Iniciar login Google OAuth2
- `GET /google/callback` - Callback Google OAuth2

### Usuários (`/api/v1/users`)
- `GET /` - Listar usuários
- `GET /:id` - Buscar usuário por ID
- `PATCH /:id` - Atualizar usuário
- `DELETE /:id` - Remover usuário

## 📱 Frontend - Páginas

### Páginas Implementadas
- **`/`** - Dashboard principal (estatísticas, ações rápidas)
- **`/auth/login`** - Login (email/senha + Google OAuth2)
- **`/auth/register`** - Cadastro (formulário completo + Google OAuth2)
- **`/auth/callback`** - Callback OAuth2 Google
- **`/profile`** - Perfil do usuário (protegido)

### Funcionalidades
- ✅ Navegação responsiva (mobile-first)
- ✅ Autenticação JWT + Refresh Token
- ✅ Login social Google OAuth2
- ✅ Proteção de rotas privadas
- ✅ Feedback visual (loading, toasts, erros)
- ✅ Formulários com validação
- ✅ Design system com TailwindCSS

## 📚 Check-in de Leitura e Gamificação

### Como registrar um check-in
1. Acesse seu perfil
2. Preencha o formulário de check-in (ID do livro, páginas lidas, página atual, tempo de leitura, nota de áudio opcional)
3. Clique em "Registrar Check-in"
4. Veja seu XP, moedas e progresso de nível atualizados em tempo real

### Histórico de check-ins
- A timeline mostra todos os check-ins feitos para cada livro, incluindo data, páginas lidas, duração e áudio (se houver)
- O histórico é atualizado automaticamente após cada novo check-in

### Gamificação visual
- Barra de progresso mostra XP atual e necessário para o próximo nível
- Nível e saldo de moedas são exibidos no topo do perfil
- Feedback visual (toasts, loaders, animações) em todas as ações

### Endpoints principais (backend)
- `POST /api/v1/checkins` — Registrar check-in
- `POST /api/v1/checkins/audio` — Upload de áudio (.mp3)
- `POST /api/v1/checkins/history/:bookId` — Histórico de check-ins por livro
- `POST /api/v1/checkins/stats` — Stats de gamificação do usuário

### Exemplos de uso (frontend)
- O frontend consome esses endpoints via hooks e componentes React, exibindo feedback visual e atualizando a interface em tempo real.

## 🧪 Como Testar

### 1. Configuração Inicial
```bash
# 1. Clonar e instalar
git clone <repo>
cd readsy
pnpm install

# 2. Subir banco de dados
docker-compose up -d

# 3. Configurar ambiente backend
cd apps/api
cp .env.example .env
# Editar DATABASE_URL e secrets

# 4. Executar migrations
pnpm exec prisma migrate dev
pnpm exec ts-node prisma/seed.ts

# 5. Configurar ambiente frontend
cd ../web
echo "NEXT_PUBLIC_API_URL=http://localhost:3333" > .env.local
```

### 2. Executar Aplicação
```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

### 3. Testar Funcionalidades

#### Autenticação por Email/Senha
1. Acesse http://localhost:3000
2. Clique em "Criar Conta"
3. Preencha: nome, username, email, senha
4. Teste login com as credenciais criadas

#### Google OAuth2
1. Configure Google OAuth2 (veja seção acima)
2. Na tela de login, clique "Google"
3. Complete o fluxo OAuth2
4. Deve redirecionar para dashboard

#### Navegação e UX
- Teste responsividade (mobile/desktop)
- Teste navegação entre páginas
- Teste logout
- Verifique toasts de sucesso/erro

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM TypeScript
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Passport** - Estratégias de autenticação
- **Bcrypt** - Hash de senhas
- **Helmet** - Segurança
- **Express Rate Limit** - Rate limiting

### Frontend
- **Next.js 14** - Framework React
- **TailwindCSS** - Styling
- **React Hook Form** - Formulários
- **Zod** - Validação
- **Axios** - HTTP Client
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones
- **js-cookie** - Gerenciamento de cookies

### DevOps e Qualidade
- **TurboRepo** - Monorepo
- **TypeScript** - Tipagem
- **ESLint + Prettier** - Linting e formatação
- **Husky + lint-staged** - Git hooks
- **Docker** - Containerização

## 📋 Padrões e Convenções

- **Commits**: Conventional Commits
- **Branches**: feature/, bugfix/, hotfix/
- **Naming**: camelCase (JS/TS), kebab-case (CSS)
- **Mobile-first**: Design responsivo
- **Acessibilidade**: ARIA labels, contrastes
- **SEO**: Meta tags, semântica HTML

## 🎯 Próximos Passos

### Fase 4 (Planejada)
- [ ] CRUD completo de livros
- [ ] Sistema de estantes
- [ ] Check-ins de leitura
- [ ] Busca e filtros
- [ ] Sistema de grupos
- [ ] Desafios de leitura
- [ ] Sistema de pontos/moedas
- [ ] Loja de itens

### Melhorias Técnicas
- [ ] Testes unitários e E2E
- [ ] Cache com Redis
- [ ] Upload de imagens
- [ ] PWA completo
- [ ] Otimização de performance
- [ ] Monitoramento e logs 