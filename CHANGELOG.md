# CHANGELOG

## [4.0.0] - Fase 4: Estante, Check-in e Gamificação Visual

### Backend
- CRUD completo de estantes (Shelf) com manipulação de livros (adicionar, remover, reordenar)
- Endpoints de busca/cadastro de livros (Google Books, OpenLibrary, manual, ISBN)
- Endpoints de check-in: registro, upload de áudio, histórico, stats de gamificação
- Limitação de 1 check-in por livro/hora
- Cálculo e atualização de XP, moedas, nível do usuário

### Frontend
- Formulário de check-in integrado (com upload de áudio .mp3)
- Timeline/histórico de check-ins por livro
- Barra de progresso, XP, moedas e nível do usuário (stats reais)
- Feedback visual: toasts, loaders, animações
- Integração completa com backend de gamificação

### Documentação
- README.md atualizado com instruções de uso do check-in, histórico e gamificação
- Exemplos de uso dos endpoints frontend/backend

---

## [3.0.0] - Fase 3: Autenticação, Frontend Inicial e Navegação

### Adicionado

#### Backend - Autenticação
- AuthService completo com registro, login, refresh token, logout e Google OAuth2
- AuthController com endpoints `/api/v1/auth/*`
- Validação de unicidade de email/username no registro
- Hash de senhas com bcrypt (salt 12)
- Geração de JWT e refresh tokens
- Proteção contra brute-force e rate limiting
- JwtAuthGuard para proteção de rotas privadas
- Estratégias Passport (JWT e Google OAuth2)
- DTOs de validação (RegisterDto, LoginDto, RefreshTokenDto)

#### Frontend - Páginas e Navegação
- Configuração TailwindCSS com paleta de cores do projeto
- Layout raiz com AuthProvider e Toaster
- Navegação responsiva (desktop + mobile) com menu hamburger
- Página de dashboard (`/`) com estatísticas e ações rápidas
- Página de login (`/auth/login`) com email/senha + Google OAuth2
- Página de registro (`/auth/register`) com formulário completo + Google OAuth2
- Página de callback OAuth2 (`/auth/callback`)
- Página de perfil (`/profile`) com proteção de rota

#### Sistema de Autenticação
- Cliente HTTP (Axios) com interceptors para JWT
- Context React para gerenciamento de estado de autenticação
- Refresh automático de tokens expirados
- Persistência de tokens em cookies
- Redirecionamento automático em caso de token inválido

#### UX e Feedback
- Toasts para feedback de ações (sucesso/erro)
- Loading states em formulários e navegação
- Validação de formulários em tempo real
- Design mobile-first e responsivo
- Ícones Lucide React em toda interface

### Configurado
- PostCSS + Autoprefixer para TailwindCSS
- Next.js App Router com TypeScript
- Path aliases (@/* para imports)
- Cookies seguros para tokens JWT
- CORS e headers de segurança (Helmet)
- Rate limiting em endpoints de autenticação

### Melhorado
- README.md com instruções completas de OAuth2
- Documentação de todos endpoints e páginas
- Instruções de teste para autenticação
- env.md atualizado com variáveis OAuth2

### Dependências Adicionadas

#### Backend
- bcrypt + @types/bcrypt
- @nestjs/jwt
- @nestjs/passport
- passport + passport-jwt + passport-google-oauth20

#### Frontend
- tailwindcss + @tailwindcss/forms + autoprefixer + postcss
- react-hook-form + zod
- axios + js-cookie + @types/js-cookie
- react-hot-toast
- lucide-react
- clsx

---

## [2.0.0] - Fase 2: Database e Backend Base

### Adicionado
- Schema Prisma completo com 12 modelos
- Relacionamentos N:N com tabelas intermediárias (UserFollow, GroupMember, etc)
- Seeds para Country (10), Language (10) e ShopItem (5)
- PrismaService global no NestJS
- UserService com CRUD completo e tratamento de erros
- DTOs de validação com class-validator
- Estrutura modular DDD no backend
- Configuração de segurança (Helmet, rate limit, CORS)

### Configurado
- PostgreSQL + Redis + Adminer via Docker Compose
- Migrations e client Prisma
- Middleware de segurança no NestJS
- Estrutura de controllers e services

---

## [1.0.0] - Fase 1: Monorepo e Infraestrutura

### Adicionado
- Estrutura de monorepo com TurboRepo
- Pastas apps/web (Next.js), apps/api (NestJS), apps/admin (Next.js)
- Pastas libs/ui, libs/types, libs/utils
- Configuração de TypeScript compartilhada (tsconfig.base.json)
- ESLint e Prettier compartilhados
- Husky + lint-staged para pre-commit
- Commitlint para convencional commits
- Scripts globais no package.json
- pnpm-workspace.yaml
- turbo.json
- .gitignore, .prettierrc, .eslintrc.js, .lintstagedrc, commitlint.config.js
- README.md explicativo
- env.md com variáveis de ambiente
- docker-compose.yml com PostgreSQL, Redis e Adminer

### Observações
- Estrutura pronta para desenvolvimento fullstack, mobile-first e deploy rápido no EasyPanel. 