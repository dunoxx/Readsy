# CHANGELOG — Fase 1

## [1.0.0] - Fase Inicial

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