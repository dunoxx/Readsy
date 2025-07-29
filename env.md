# Exemplo de .env para Readsy API

# String de conexão do PostgreSQL
DATABASE_URL=postgresql://readsy:readsy@localhost:5432/readsy_db

# Segredo para geração/validação dos tokens JWT de acesso
JWT_SECRET=um-segredo-super-seguro

# Segredo para geração/validação dos refresh tokens
JWT_REFRESH_SECRET=um-refresh-segredo-super-seguro

# Tempo de expiração do token JWT (ex: 15m, 1h, 7d)
JWT_EXPIRES_IN=1h

# String de conexão do Redis
REDIS_URL=redis://localhost:6379

# URL pública da API
API_URL=http://localhost:3333

# Porta para o backend (opcional)
PORT=3333

# Ambiente de execução (development, production, etc)
NODE_ENV=development

# --- OAuth2 Google ---
# Client ID do Google Cloud Console
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
# Client Secret do Google Cloud Console
GOOGLE_CLIENT_SECRET=seu-client-secret
# URL de callback configurada no Google Cloud Console
GOOGLE_CALLBACK_URL=http://localhost:3333/api/v1/auth/google/callback 