# Readsy Monorepo

Monorepo do projeto **Readsy** utilizando TurboRepo, Next.js, NestJS, TypeScript, ESLint, Prettier, Husky, lint-staged e commitlint.

## Estrutura

```
apps/
  web/     → Next.js (SPA responsivo, PWA-ready, mobile-first)
  api/     → NestJS (backend modular, DDD)
  admin/   → Next.js (painel administrativo)
libs/
  ui/      → Componentes React compartilhados
  types/   → Tipos globais (DTOs, enums, models)
  utils/   → Funções utilitárias, helpers, validadores
```

## Comandos principais

- `pnpm install` — Instala todas as dependências
- `pnpm dev` — Sobe todos os apps em modo desenvolvimento
- `pnpm build` — Builda todos os apps/libs
- `pnpm lint` — Lint em todos os workspaces
- `pnpm test` — Testes (quando implementados)
- `pnpm format` — Formata o código com Prettier
- `pnpm prepare` — Instala hooks do Husky
- `pnpm commit` — Commit com commitizen (opcional)

## Como rodar cada app individualmente

Entre na pasta do app desejado e rode `pnpm dev` ou `pnpm build`.

## Docker Compose

O projeto inclui um `docker-compose.yml` pronto para EasyPanel, com PostgreSQL, Redis e Adminer.

## Padrões e boas práticas

- TypeScript em todos os workspaces
- ESLint e Prettier compartilhados
- Husky + lint-staged para pre-commit
- Commitlint para convencional commits
- Estrutura modular e escalável

## Paleta de cores

- Primary: #1E293B
- Light: #F9FAFB
- Blue alert: #4F9DDE
- Green alert: #6EE7B7
- Yellow alert: #FCD34D
- Red alert: #EF4444

## Documentação de variáveis de ambiente

Veja o arquivo `env.md` para detalhes de todas as variáveis necessárias.

---

Para dúvidas ou sugestões, abra uma issue. 