# Changelog

Todas as alterações notáveis no projeto Readsy serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [0.2.0] - 2024-04-30

### Adicionado

#### Backend (NestJS)
- Modelos de domínio no Prisma Schema:
  - User: perfil completo com dados básicos e preferências
  - Book: informações sobre livros
  - Group: grupos de leitura
  - Checkin: registro de sessões de leitura
  - Challenge: desafios de leitura
  - LeaderboardEntry: sistema de classificação
- APIs CRUD básicas para as entidades:
  - User: gerenciamento de usuários
  - Book: gerenciamento de livros
  - Checkin: registro e listagem de checkins de leitura
- Controladores RESTful para todas as entidades
- Validação de dados usando class-validator
- Tratamento de erros customizado
- Script de seed para popular o banco com dados iniciais de teste

#### Documentação
- Atualização do README.md com instruções detalhadas:
  - Como configurar e executar o projeto localmente
  - Como executar migrações do banco de dados
  - Como testar as APIs básicas usando curl
  - Documentação básica da API

### Alterado
- Schema do Prisma atualizado com novos modelos e relacionamentos
- Refatoração da estrutura dos módulos para seguir padrões de arquitetura limpa
- README com exemplos práticos de uso das APIs

### Próximos Passos
- Implementação de autenticação JWT e proteção de rotas
- Integração OAuth2 (Google, Telegram)
- Desenvolvimento do frontend em Next.js
- Upload de imagens de perfil e capa de livros

## [0.1.0] - 2024-04-26

### Adicionado

#### Estrutura do Projeto
- Criação da estrutura de monorepo com `/backend` e `/frontend`
- Configuração do `package.json` raiz com scripts para gerenciar ambos os projetos
- Adição de arquivos de documentação (`README.md`)
- Configuração de `.gitignore` para excluir arquivos desnecessários

#### Backend (NestJS)
- Configuração inicial do NestJS com TypeScript
- Estrutura modular para os seguintes domínios:
  - User (usuários)
  - Auth (autenticação)
  - Book (livros)
  - Group (grupos)
  - Checkin (check-ins de leitura)
  - Challenge (desafios)
  - Leaderboard (classificação)
  - Admin (administração)
- Integração com Prisma ORM para acesso ao banco de dados PostgreSQL
- Configuração de arquivos `.env.sample` para variáveis de ambiente
- Configuração inicial de autenticação JWT
- Preparação para suporte OAuth2 (Google e Telegram)
- Endpoint Swagger para documentação da API

#### Frontend (Next.js)
- Configuração inicial do Next.js com TypeScript e App Router
- Integração com Tailwind CSS para estilização
- Componentes UI usando shadcn/ui (baseado em Radix UI)
- Suporte a temas (claro/escuro) com next-themes
- Configuração de internacionalização (i18n) para múltiplos idiomas (PT, EN, ES)
- Estrutura inicial de componentes, hooks e utilidades
- Página de exemplo com layout básico

#### DevOps
- Dockerfile para backend (NestJS)
- Dockerfile para frontend (Next.js)
- Configuração de docker-compose.yml com serviços para:
  - Backend
  - Frontend
  - PostgreSQL
  - Redis
- Scripts para desenvolvimento, build e deploy

#### Banco de Dados
- Schema do Prisma com os seguintes modelos:
  - User
  - Book
  - UserBook
  - Checkin
  - Challenge
  - UserChallenge
  - ChallengeBook
  - Group
  - UserGroup
- Configuração de relacionamentos entre entidades
- Suporte a migrações e seed do banco de dados

#### Qualidade de Código
- Configuração de ESLint para validação de código
- Configuração de Prettier para formatação de código
- Configuração de Husky para hooks de pré-commit
- Configuração de lint-staged para validação de arquivos alterados

### Alterado
- N/A (versão inicial)

### Removido
- N/A (versão inicial)

### Correções
- N/A (versão inicial) 