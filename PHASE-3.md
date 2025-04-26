# Fase 3 - Readsy: Implementação de Autenticação e Proteção de Rotas

## Visão Geral

Na terceira fase do projeto Readsy, foi implementado o sistema completo de autenticação utilizando JWT e OAuth2 (Google). Além disso, foram adicionadas proteções nas rotas sensíveis da API para garantir que apenas usuários autenticados possam acessá-las.

## Implementações Realizadas

### 1. Autenticação JWT

Foi implementado um sistema de autenticação completo utilizando JWT (JSON Web Tokens) com:

- **Access Token**: Token de curta duração (15 minutos) para acesso à API
- **Refresh Token**: Token de longa duração (7 dias) para renovação do access token

O schema do Prisma foi atualizado para adicionar o campo `refreshToken` no modelo User:

```prisma
model User {
  // campos existentes...
  refreshToken      String?
  // outros campos...
}
```

#### Endpoints de Autenticação

| Método | Rota | Ação | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/signup` | Cadastro | Registra um novo usuário com email e senha |
| `POST` | `/api/auth/login` | Login | Autentica um usuário existente |
| `POST` | `/api/auth/refresh` | Refresh | Renova o access token usando refresh token |
| `POST` | `/api/auth/logout` | Logout | Revoga o refresh token do usuário |

### 2. Integração com OAuth2 (Google)

Foi adicionado o login social via Google para permitir que usuários se registrem e façam login utilizando suas contas Google:

| Método | Rota | Ação | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/auth/google` | Redirecionamento | Redireciona para o login do Google |
| `GET` | `/api/auth/google/callback` | Callback | Processa o resultado da autenticação Google |

O sistema foi implementado com os seguintes comportamentos:
- Se o email já existir no banco, o usuário é logado
- Se o email não existir, um novo usuário é criado automaticamente

### 3. Proteção de Rotas

Foi implementado o guard `JwtAuthGuard` para proteger rotas sensíveis, permitindo acesso apenas a usuários autenticados.

Rotas protegidas:
- **Books API**:
  - Criar livros (`POST /api/books`)
  - Atualizar livros (`PATCH /api/books/:id`)
  - Remover livros (`DELETE /api/books/:id`)
- **Checkins API**:
  - Buscar checkins de usuário (`GET /api/checkins/user/:userId`)
  - Criar checkins (`POST /api/checkins/user/:userId`)
  - Remover checkins (`DELETE /api/checkins/:id`)

### 4. Documentação Swagger

A documentação Swagger foi atualizada para incluir:
- Esquemas de autenticação JWT (Bearer Token)
- Endpoints de autenticação documentados
- Indicação de quais rotas necessitam de autenticação

## Configuração

### Variáveis de Ambiente

Para o funcionamento correto da autenticação, as seguintes variáveis devem ser adicionadas ao arquivo `.env`:

```
# JWT Authentication
JWT_ACCESS_SECRET="seu-access-token-secret-aqui"
JWT_REFRESH_SECRET="seu-refresh-token-secret-aqui"

# Google OAuth2
GOOGLE_CLIENT_ID="seu-client-id-aqui"
GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"
```

### Configuração do Google OAuth2

Para configurar o login via Google:

1. Acesse o [Google Developer Console](https://console.developers.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Em "APIs e Serviços" > "Credenciais", clique em "Criar credenciais" > "ID do cliente OAuth"
4. Selecione "Aplicativo da Web"
5. Configure o URI de redirecionamento autorizado: `http://localhost:3001/api/auth/google/callback` (em desenvolvimento)
6. Copie o Client ID e Client Secret para o arquivo `.env`

## Uso da Autenticação

### Fluxo de Login Normal

1. Registrar um usuário:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "displayName": "Usuário Exemplo"
  }'
```

2. Fazer login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

3. Obter os tokens (access_token e refresh_token)

4. Acessar rotas protegidas com o access_token:
```bash
curl -X GET http://localhost:3001/api/checkins/user/seu-user-id \
  -H "Authorization: Bearer seu-access-token"
```

### Renovação de Token e Logout

1. Renovar o access token quando expirar:
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer seu-refresh-token" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu-refresh-token"
  }'
```

2. Fazer logout:
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer seu-access-token"
```

### Login Social via Google

1. Redirecionar o usuário para:
```
http://localhost:3001/api/auth/google
```

2. Após autenticação, o usuário será redirecionado para a callback URL configurada com os tokens de acesso.

## Próximos Passos (Fase 4)

- Implementação de permissões e autorização baseada em perfil
- Integração com Firebase para envio de notificações push
- Upload de imagens para fotos de perfil e capas de livros
- Desenvolvimento do frontend em Next.js
- Implementação de rotas privadas no frontend 