# Readsy

Readsy é uma aplicação moderna para gerenciamento de leituras, construída com Next.js, NestJS e PostgreSQL.

## Estrutura do Projeto

O projeto é organizado como um monorepo usando pnpm workspaces:

```
/apps
  /web: Aplicação Next.js (frontend)
  /api: Aplicação NestJS (backend)
/packages
  /ui: Componentes React compartilhados
  /types: Definições TypeScript compartilhadas
  /config: Configurações compartilhadas
```

## Requisitos

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/readsy.git
cd readsy
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados:
```bash
cd apps/api
pnpm prisma migrate dev
```

## Desenvolvimento

Para iniciar o ambiente de desenvolvimento:

```bash
# Inicia todos os serviços
pnpm dev

# Inicia apenas o frontend
pnpm --filter @readsy/web dev

# Inicia apenas o backend
pnpm --filter @readsy/api dev
```

## Build

Para construir o projeto:

```bash
# Build de todos os pacotes
pnpm build

# Build do frontend
pnpm --filter @readsy/web build

# Build do backend
pnpm --filter @readsy/api build
```

## Deploy

O projeto está configurado para deploy no EasyPanel. Os Dockerfiles estão configurados para produção em:

- `apps/web/Dockerfile`
- `apps/api/Dockerfile`

## Scripts Disponíveis

- `pnpm dev`: Inicia o ambiente de desenvolvimento
- `pnpm build`: Build de todos os pacotes
- `pnpm lint`: Executa o linter em todos os pacotes
- `pnpm format`: Formata o código usando Prettier
- `pnpm clean`: Remove arquivos gerados e node_modules

## Tecnologias Principais

- Frontend: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- Backend: NestJS, Prisma, PostgreSQL
- Ferramentas: TypeScript, ESLint, Prettier, pnpm 