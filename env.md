# Variáveis de Ambiente — Readsy

## apps/web
- `NEXT_PUBLIC_API_URL` — URL base da API para o frontend web
- `NEXT_PUBLIC_APP_URL` — URL pública do frontend web

## apps/admin
- `NEXT_PUBLIC_API_URL` — URL base da API para o painel admin
- `NEXT_PUBLIC_ADMIN_URL` — URL pública do painel admin

## apps/api
- `DATABASE_URL` — String de conexão do PostgreSQL
- `REDIS_URL` — String de conexão do Redis
- `JWT_SECRET` — Segredo para geração/validação de tokens JWT
- `API_URL` — URL pública da API

## Observações
- Nunca versionar arquivos .env com valores reais.
- Sempre consulte este arquivo para saber o que precisa ser configurado em cada ambiente. 