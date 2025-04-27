# Changelog

Todas as alterações notáveis no projeto Readsy serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [0.6.5.1] - 2024-06-15

### Adicionado
- Endpoint `/api/books/search` para busca de livros locais e externos (OpenLibrary e Google Books).
- Salvamento automático de livros no banco de dados do Readsy.
- Estrutura preparada para futura atualização de livros incompletos.
- Novos campos no modelo Book: publishedDate, description, publisher e language.
- Indexação de ISBN para buscas mais rápidas.

### Atualizado
- Documentação Swagger para novo endpoint de busca de livros.
- Serviço de livros com validação e prevenção de duplicatas.

### Próximos Passos
- Implementar atualização periódica de livros com dados incompletos.
- Adicionar suporte a gêneros e editoras na busca.

## [0.6.5] - 2024-06-12

### Adicionado
- Endpoint `/api/stats/me` para estatísticas do usuário autenticado.
- Endpoint `/api/admin/stats/global` para estatísticas globais da plataforma.
- Serviço de estatísticas usando Prisma ORM otimizado.
- Estatísticas completas de leitura, incluindo páginas lidas e tempo de leitura.
- Estatísticas de livros por status (lendo, finalizado, abandonado, planejado).
- Lista dos usuários mais ativos da plataforma.

### Atualizado
- Documentação Swagger para novos endpoints de estatísticas.
- Proteção dos endpoints com autenticação JWT e verificação de papel (ADMIN).

### Próximos Passos
- Exibir estatísticas nos dashboards do usuário e do admin.
- Criar relatórios personalizados para temporada.
- Adicionar gráficos e visualizações das estatísticas.

## [0.6.3.1] - 2024-06-10

### Adicionado
- Paginação com cursor na Timeline pública (`GET /api/posts`).
- Endpoint para listar posts de um usuário (`GET /api/posts/user/:userId`).
- Sistema Anti-Flood: Limite de 3 posts a cada 30 minutos por usuário.
- Validação do limite máximo de itens por página (máx: 50).

### Atualizado
- Remoção do sistema de paginação por número de página em favor da paginação por cursor.
- Documentação Swagger para todos os novos comportamentos e endpoints.
- Melhor retorno de metadados para facilitar implementação de scroll infinito.

### Próximos Passos
- Exibir Timeline no frontend com scroll infinito.
- Implementar notificações para reações em posts.

## [0.6.3] - 2024-06-08

### Adicionado
- Implementação do sistema de Timeline de Postagens.
- Possibilidade de criar posts com ou sem spoiler.
- Sistema de Reações a posts (LIKE, LOVE, LAUGH, WOW, SAD, ANGRY).
- Proteção de rotas com autenticação JWT.
- Paginação na listagem de posts da timeline.
- Endpoint para remover reações de posts.
- Atualização da documentação Swagger com todos os novos endpoints.

### Próximos Passos
- Exibir Timeline no frontend.
- Sistema de notificações futuras baseado em reações e posts.

## [0.6.2.1] - 2024-06-05

### Adicionado
- Campo `status` no modelo Book (enum BookStatus: READING, FINISHED, ABANDONED, PLANNING).
- Novo endpoint `PATCH /api/books/:id/status` para atualizar status de leitura.
- Validação de status nos Tipos de Quest `FINISH_BOOK` e `UPDATE_BOOK_STATUS`.
- Atualização do Prisma Schema e da documentação Swagger.
- Verificação de autorização (apenas o proprietário do livro pode alterar seu status).

### Próximos Passos
- Implementar sistema de Timeline e Convites de Amigos para completar QuestTypes futuros.

## [0.6.2] - 2024-06-03

### Adicionado

#### Sistema de Quests Inteligentes 
- Implementação do Sistema de Tipos de Quest com enum `QuestType`
- Adição de 10 tipos distintos de quests (CHECKIN_DAY, READ_PAGES, FINISH_BOOK, etc.)
- Suporte a parâmetros personalizados para cada tipo de missão
- Validação específica de requisitos para cada tipo de quest
- Validação automática de conclusão de quests baseada em ações do usuário
- Verificação inteligente de requisitos para marcar quests como concluídas

#### Melhorias no Sistema de Gamificação
- Verificação automática de atividades do usuário para validar quests
- Novas regras para completar quests baseadas no tipo específico
- Validação de parâmetros necessários para cada tipo de quest ao criar novas
- Suporte a valores dinâmicos como alvo para quests (páginas lidas, livros completados, etc.)

#### Atualização Modelos de Dados
- Adição do campo `questType` em DailyQuest e WeeklyQuest
- Adição do campo `parameters` do tipo Json para armazenar configurações personalizadas
- Manutenção do campo `isActive` para controle de quests disponíveis

#### Atualização de APIs
- APIs existentes expandidas para incluir o tipo da quest e parâmetros
- Melhor formatação das respostas de quest com informações completas
- Validação mais robusta de entradas com class-validator

### Modificado
- Serviço de Quests completamente refatorado para utilizar validação baseada em tipos
- Melhoria na lógica de atribuição de quests a usuários
- Sistema de verificação de conclusão de quests agora considera parâmetros dinâmicos
- Reformulação da lógica de sorteio de quests para usuários

### Próximos Passos
- Implementação de frontend específico para o sistema de quests inteligentes
- Painéis de administração para gerenciamento de quests com configuração visual
- Possibilidade de configurar sequências de quests progressivas
- Sistema de achievements automatizados baseados em tipos de quests completadas

## [0.6.1] - 2024-05-28

### Adicionado

#### Sistema de Quests Inteligentes 
- Implementação do Sistema de Tipos de Quest com enum `QuestType`
- Adição de 10 tipos distintos de quests (CHECKIN_DAY, READ_PAGES, FINISH_BOOK, etc.)
- Suporte a parâmetros personalizados para cada tipo de missão
- Validação específica de requisitos para cada tipo de quest
- Validação automática de conclusão de quests baseada em ações do usuário
- Verificação inteligente de requisitos para marcar quests como concluídas

#### Melhorias no Sistema de Gamificação
- Verificação automática de atividades do usuário para validar quests
- Novas regras para completar quests baseadas no tipo específico
- Validação de parâmetros necessários para cada tipo de quest ao criar novas
- Suporte a valores dinâmicos como alvo para quests (páginas lidas, livros completados, etc.)

#### Atualização Modelos de Dados
- Adição do campo `questType` em DailyQuest e WeeklyQuest
- Adição do campo `parameters` do tipo Json para armazenar configurações personalizadas
- Manutenção do campo `isActive` para controle de quests disponíveis

#### Atualização de APIs
- APIs existentes expandidas para incluir o tipo da quest e parâmetros
- Melhor formatação das respostas de quest com informações completas
- Validação mais robusta de entradas com class-validator

### Modificado
- Serviço de Quests completamente refatorado para utilizar validação baseada em tipos
- Melhoria na lógica de atribuição de quests a usuários
- Sistema de verificação de conclusão de quests agora considera parâmetros dinâmicos
- Reformulação da lógica de sorteio de quests para usuários

### Próximos Passos
- Implementação de frontend específico para o sistema de quests inteligentes
- Painéis de administração para gerenciamento de quests com configuração visual
- Possibilidade de configurar sequências de quests progressivas
- Sistema de achievements automatizados baseados em tipos de quests completadas 

## [0.5.0] - 2024-05-22

### Adicionado

#### Sistema de Gamificação
- Implementação completa do módulo `GamificationModule` para gerenciar o sistema de gamificação:
  - Sistema de níveis e XP baseado na sequência de Fibonacci
  - Limite máximo de nível (Level 10) com trava de XP
  - Sistema de temporadas (Primavera, Verão, Outono, Inverno)
  - Recompensas de Coins ao subir de nível
  - Premiação de temporada com distribuição de Coins para os melhores jogadores
  - Critérios de desempate no Leaderboard

- Implementação do sistema de Desafios Globais e de Grupo:
  - Modelos de desafios com XP e Coins configuráveis baseados em Fibonacci
  - Desafios por temporada com recompensas
  - Desafios internos de grupo com contribuição para o ranking do grupo
  - Diferentes tipos de desafios (diários, semanais, mensais e especiais)

#### Novas APIs
- **Gamification API**:
  - `GET /api/gamification/status`: Obter status de gamificação do usuário
  - `GET /api/gamification/status/:userId`: Obter status de gamificação de um usuário específico
  - `POST /api/gamification/add-xp`: Adicionar XP para um usuário
  - `POST /api/gamification/reset-season`: Resetar temporada (admin)
  - `GET /api/gamification/level-rewards`: Obter tabela de recompensas por nível
  - `GET /api/gamification/challenge-options`: Obter opções de XP e Coins para desafios

- **Global Challenge API**:
  - `POST /api/challenges/global/create`: Criar novo modelo de desafio global
  - `GET /api/challenges/global/list`: Listar todos os modelos de desafios globais
  - `GET /api/challenges/global/list/:type`: Listar modelos de desafios globais por tipo
  - `GET /api/challenges/global/:id`: Buscar modelo de desafio global por ID
  - `POST /api/challenges/global/complete/:templateId`: Completar um desafio global

- **Group Challenge API**:
  - `POST /api/challenges/groups/:groupId/challenge/create`: Criar desafio de grupo baseado em modelo global
  - `POST /api/challenges/groups/:groupId/challenge/:challengeId/complete`: Completar um desafio de grupo

#### Melhorias de Segurança e Validação
- Validação de entradas usando class-validator para todos os novos endpoints
- Proteção de rotas sensíveis usando JwtAuthGuard
- Verificações para evitar XP infinito e respeitar o nível máximo
- Validação para garantir que XP e Coins em desafios sigam as sequências de Fibonacci

#### Documentação
- Documentação Swagger atualizada para todos os novos endpoints
- Atualização do CHANGELOG com as novas implementações
- Descrições detalhadas de parâmetros e respostas
- Exemplos de payload para todos os endpoints

### Próximos Passos
- Implementação do frontend em Next.js para o sistema de gamificação
- Interface para visualização de progresso, níveis e badges
- Dashboard de gamificação para usuários
- Sistema de notificações para conquistas e subidas de nível

## [0.4.0] - 2024-05-15

### Adicionado

#### Módulos do Backend
- Implementação completa do módulo `ChallengeModule` para gerenciamento de desafios de leitura:
  - CRUD completo para desafios
  - API para participação em desafios
  - Controle de progresso dos participantes
  - Regras de negócio para garantir que apenas o criador possa editar/remover
  - Validação para datas de início e término

- Implementação completa do módulo `GroupModule` para grupos de leitura:
  - CRUD completo para grupos
  - API para participação em grupos
  - Gestão de membros com diferentes papéis (OWNER, MEMBER)
  - Validações para garantir que apenas o proprietário possa editar/remover

- Implementação completa do módulo `LeaderboardModule`:
  - Ranking global de usuários
  - Ranking individual de usuários
  - Sistema de temporadas (trimestral)
  - Cálculo de posições baseado na pontuação
  - Endpoint para adicionar pontos ao usuário

#### Endpoints e APIs
- **Challenge API**:
  - `GET /api/challenges`: Listar todos os desafios
  - `GET /api/challenges/public`: Listar desafios públicos
  - `GET /api/challenges/:id`: Buscar desafio por ID
  - `GET /api/challenges/created-by/:userId`: Buscar desafios criados por um usuário
  - `GET /api/challenges/participated-by/:userId`: Buscar desafios em que um usuário participa
  - `POST /api/challenges`: Criar novo desafio
  - `PATCH /api/challenges/:id`: Atualizar desafio existente
  - `DELETE /api/challenges/:id`: Remover desafio
  - `POST /api/challenges/:challengeId/join`: Participar de um desafio
  - `POST /api/challenges/:challengeId/leave`: Sair de um desafio
  - `PATCH /api/challenges/:challengeId/progress`: Atualizar progresso em um desafio

- **Group API**:
  - `GET /api/groups`: Listar todos os grupos
  - `GET /api/groups/:id`: Buscar grupo por ID
  - `GET /api/groups/member/:userId`: Buscar grupos em que um usuário participa
  - `GET /api/groups/owner/:userId`: Buscar grupos criados por um usuário
  - `POST /api/groups`: Criar novo grupo
  - `PATCH /api/groups/:id`: Atualizar grupo existente
  - `DELETE /api/groups/:id`: Remover grupo
  - `POST /api/groups/:groupId/join`: Entrar em um grupo
  - `POST /api/groups/:groupId/leave`: Sair de um grupo

- **Leaderboard API**:
  - `GET /api/leaderboard`: Obter ranking global
  - `GET /api/leaderboard/user/:userId`: Obter ranking de um usuário específico
  - `GET /api/leaderboard/me`: Obter ranking do usuário autenticado
  - `POST /api/leaderboard/add-points/:userId`: Adicionar pontos para um usuário

#### Melhorias de Segurança e Validação
- Todas as rotas protegidas com `JwtAuthGuard`
- Validação avançada de DTOs para todos os novos endpoints
- Verificações de permissão (apenas criador/proprietário pode editar/remover)
- Validação de datas para garantir coerência temporal

#### Documentação
- Documentação Swagger para todos os novos endpoints
- Descrições detalhadas de parâmetros e respostas
- Marcação de rotas que requerem autenticação

### Modificado
- Melhoria na definição de tipos com uso de interfaces específicas (ex: `RequestWithUser`)
- Otimização das consultas Prisma para inclusão de entidades relacionadas
- Padronização de formatos de resposta e tratamento de erros em todos os módulos

### Próximos Passos
- Implementação do frontend em Next.js para as novas funcionalidades
- Sistema de upload de imagens para livros e perfis de usuário
- Sistema de notificações para atividades em grupos e desafios
- Implementação de estatísticas de leitura e relatórios

## [0.3.5] - 2024-05-08

### Adicionado

#### Frontend (Next.js)
- Implementação de páginas de Login (`/login`) e Cadastro (`/signup`) com Next.js App Router
- Gerenciamento de sessão usando Zustand
- Integração de login tradicional e social (Google OAuth)
- Middleware de proteção de rotas privadas
- Hook `useAuth` para controle de sessão
- Componentes de formulário e botão personalizados
- Página inicial de dashboard protegida

## [0.3.0] - 2024-05-01

### Adicionado

#### Sistema de Autenticação
- Implementação completa de autenticação JWT com access e refresh tokens
- Adição do campo `refreshToken` ao modelo User no Prisma
- Criação de estratégias para autenticação JWT
- Implementação de login social via Google (OAuth2)
- Proteção de rotas sensíveis com JwtAuthGuard

#### Módulos e Serviços
- AuthModule com funcionalidades completas de autenticação
- AuthService para gerenciamento de tokens e autenticação
- Estratégias de autenticação (JWT, JWT Refresh, Google)
- Guards para proteção de rotas

#### Endpoints de Autenticação
- `POST /api/auth/signup`: Cadastro de novos usuários
- `POST /api/auth/login`: Login com email e senha
- `POST /api/auth/refresh`: Renovação de tokens
- `POST /api/auth/logout`: Revogação de refresh token
- `GET /api/auth/google`: Redirecionamento para autenticação Google
- `GET /api/auth/google/callback`: Callback de autenticação Google

### Modificado
- Proteção das rotas de criação e atualização de Books
- Proteção das rotas de Checkins
- Atualização do README com informações sobre autenticação
- Melhorias na documentação Swagger (adição de Bearer Auth)
- Atualização das dependências para suporte a JWT e OAuth2

### Próximos Passos
- Implementação de permissões baseadas em perfil
- Upload de imagens para perfil e capas de livros
- Desenvolvimento do frontend em Next.js

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

## Fase 0.7 - Implementação do Módulo de Leaderboard - 20 de julho de 2024

### Adicionado
- Implementação completa do módulo de leaderboard (`LeaderboardModule`)
- Endpoint para ranking global: `GET /api/leaderboard/global` que retorna os top 100 usuários
- Endpoint para ranking de grupos: `GET /api/leaderboard/group/:groupId` que retorna os top 100 usuários de um grupo
- Endpoint para obter a posição do usuário autenticado: `GET /api/leaderboard/me`
- Endpoint para obter a posição de um usuário específico: `GET /api/leaderboard/user/:userId`
- Sistema de reset de temporada baseado nas estações do ano (Primavera, Verão, Outono, Inverno)
- Sistema de premiação automática no reset de temporada:
  - 1º lugar: +4000 moedas
  - 2º lugar: +2500 moedas
  - 3º lugar: +1500 moedas
  - 4º ao 10º lugares: +1000 moedas cada
  - 11º ao 100º lugares: +100 moedas cada
- Critérios complexos de desempate para o ranking (XP, data da última evolução, data de criação, livros, grupos)
- Endpoint de administração para resetar manualmente a temporada: `POST /api/leaderboard/reset-season`

### Modificado
- Atualização da estrutura do serviço de leaderboard para utilizar dados diretamente dos usuários
- Implementado sistema de tratamento de empates técnicos para compartilhamento de posições
- Otimização nas queries do sistema de ranking para melhor desempenho

## Fase 0.8 - Módulo de Grupos (2024-XX-XX)

### Adicionado
- Implementação completa do módulo de grupos de leitura (GroupModule)
- Criação, edição e gerenciamento de grupos
- Sistema de membros e administração
- Funcionalidade de transferência de propriedade do grupo
- Sistema de desafios internos do grupo
- Sistema de pontos e ranking interno
- Rastreamento de atividades dos membros
- APIs para gerenciamento completo de grupos

### Alterado
- Esquema do Prisma para suportar a estrutura de dados do grupo
- Expandida a funcionalidade de desafios para incluir desafios específicos de grupo

### Corrigido
- Otimizado o cálculo de ranking para melhor performance em grupos grandes

## Versões Anteriores
<!-- aqui viriam os changelogs anteriores -->