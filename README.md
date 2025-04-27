# Readsy

Readsy é uma plataforma de controle de leitura gamificada, mobile-first, com suporte a múltiplos idiomas e monetização via Stripe.

## Estrutura do Projeto

O projeto está organizado como um monorepo:

- `/backend`: API em NestJS
- `/frontend`: Aplicação em Next.js

## Requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL
- Redis

## Desenvolvimento Local

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/readsy.git
cd readsy
```

2. Configure os arquivos `.env` tanto no backend quanto no frontend
```bash
# No backend
cp backend/.env.sample backend/.env

# No frontend
cp frontend/.env.sample frontend/.env

# Edite os arquivos .env conforme necessário
```

3. Execute o ambiente de desenvolvimento:

```bash
# Instalar dependências
npm run install:all

# Iniciar todos os serviços com Docker
docker-compose up -d

# Executar migrações do banco de dados para criar as tabelas
npm run migration:run

# Popular o banco de dados com dados iniciais (opcional)
cd backend && npx prisma db seed && cd ..

# Iniciar desenvolvimento
npm run dev
```

## Migrações do Banco de Dados

O projeto utiliza Prisma ORM para gerenciar o banco de dados. Para trabalhar com migrações:

```bash
# Gerar uma nova migração após alterar o schema.prisma
cd backend && npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações pendentes
cd backend && npx prisma migrate deploy

# Resetar o banco de dados (CUIDADO: apaga todos os dados)
cd backend && npx prisma migrate reset
```

## Testar as APIs Básicas

Após iniciar o servidor de desenvolvimento, você pode testar as APIs usando ferramentas como Postman, Insomnia ou curl:

### Usuários

```bash
# Listar todos os usuários
curl http://localhost:3001/api/users

# Criar um novo usuário
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "displayName": "Usuário Teste"
  }'

# Buscar usuário por ID
curl http://localhost:3001/api/users/{user_id}

# Atualizar usuário
curl -X PATCH http://localhost:3001/api/users/{user_id} \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Novo Nome"
  }'

# Deletar usuário
curl -X DELETE http://localhost:3001/api/users/{user_id}
```

### Livros

```bash
# Listar todos os livros
curl http://localhost:3001/api/books

# Criar um novo livro
curl -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "O Senhor dos Anéis",
    "author": "J.R.R. Tolkien",
    "pages": 1178
  }'

# Buscar livro por ID
curl http://localhost:3001/api/books/{book_id}

# Atualizar livro
curl -X PATCH http://localhost:3001/api/books/{book_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "O Senhor dos Anéis: A Sociedade do Anel"
  }'

# Deletar livro
curl -X DELETE http://localhost:3001/api/books/{book_id}
```

### Checkins

```bash
# Listar todos os checkins
curl http://localhost:3001/api/checkins

# Criar um novo checkin
curl -X POST http://localhost:3001/api/checkins/user/{user_id} \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "id_do_livro",
    "pagesRead": 50,
    "minutesSpent": 60,
    "currentPage": 50
  }'

# Buscar checkins de um usuário
curl http://localhost:3001/api/checkins/user/{user_id}

# Buscar checkin por ID
curl http://localhost:3001/api/checkins/{checkin_id}

# Deletar checkin
curl -X DELETE http://localhost:3001/api/checkins/{checkin_id}
```

## Documentação da API

A documentação completa da API está disponível através do Swagger:

```
http://localhost:3001/api/docs
```

## Funcionalidades

- Autenticação (simples, sem JWT/OAuth2 completo nesta fase)
- Gerenciamento de usuários
- Gerenciamento de livros
- Registro de checkins de leitura
- Desafios de leitura
- Grupos de leitura
- Sistema de pontuação e classificação

## Autenticação e Segurança

O Readsy implementa um sistema de autenticação completo utilizando JWT (JSON Web Tokens):

- **Access Token**: Duração de 15 minutos para acesso às APIs protegidas
- **Refresh Token**: Duração de 7 dias para renovação do access token

Além do login tradicional com email e senha, o sistema oferece:
- Login social via Google (OAuth2)
- Proteção de rotas sensíveis
- Armazenamento seguro de senhas com bcrypt

### Configuração do OAuth2 (Google)

Para configurar o login via Google:

1. Acesse o [Google Developer Console](https://console.developers.google.com/)
2. Crie um novo projeto
3. Configure as credenciais OAuth2
4. Adicione a URL de redirecionamento: `http://localhost:3001/api/auth/google/callback`
5. Adicione as credenciais ao seu arquivo `.env`:

```
GOOGLE_CLIENT_ID="seu-client-id-aqui"
GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"
```

### Exemplo de Autenticação e Uso de APIs Protegidas

```bash
# Registrar um novo usuário
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "displayName": "Usuário Exemplo"
  }'

# Login (obter tokens)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'

# Acessar uma rota protegida
curl -X POST http://localhost:3001/api/books \
  -H "Authorization: Bearer seu-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "O Senhor dos Anéis",
    "author": "J.R.R. Tolkien",
    "pages": 1178
  }'

# Renovar access token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer seu-refresh-token" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu-refresh-token"
  }'

# Logout (revogar refresh token)
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer seu-access-token"
```

## Próximos Passos

- Implementação de autenticação JWT/OAuth2
- Implementação de upload de imagens
- Desenvolvimento do frontend
- Integração com APIs externas (OpenLibrary, Google Books)
- Monetização via Stripe 

## Frontend (Next.js)

O frontend do Readsy foi desenvolvido utilizando Next.js 14 com App Router, oferecendo uma interface moderna e responsiva para a plataforma.

### Principais Páginas

- **/login**: Página de autenticação (email/senha ou Google)
- **/cadastro**: Página de registro de novos usuários
- **/dashboard**: Painel principal do usuário (área protegida)
- **/livros**: Gerenciamento da biblioteca pessoal (área protegida)
- **/perfil**: Configurações do perfil do usuário (área protegida)
- **/desafios**: Visualização e participação em desafios de leitura (área protegida)
- **/grupos**: Participação em grupos de leitura (área protegida)

### Sistema de Autenticação no Frontend

O sistema de autenticação no frontend foi implementado utilizando as seguintes tecnologias:

- **Zustand**: Gerenciamento de estado global com persistência local
- **Axios**: Integração com APIs de autenticação do backend
- **React Hook Form + Zod**: Validação de formulários de login/cadastro
- **Next.js Middleware**: Proteção de rotas e redirecionamentos
- **JWT**: Armazenamento seguro e renovação de tokens

#### Gerenciamento de Estado (Zustand)

O estado de autenticação é gerenciado centralmente através de uma store Zustand:

```tsx
// Exemplo simplificado da store de autenticação
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      
      login: async (credentials) => {
        // Implementação da lógica de login...
      },
      
      logout: async () => {
        // Implementação da lógica de logout...
      },
      
      refreshAccessToken: async () => {
        // Lógica de renovação do token...
      }
    }),
    {
      name: 'readsy-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken
      })
    }
  )
);
```

#### Hook de Autenticação

O sistema expõe um hook `useAuth` para facilitar o uso em componentes:

```tsx
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthOptions {
  required?: boolean;
  redirectIfFound?: boolean;
  redirectTo?: string;
  redirectAuthenticatedTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    required = false,
    redirectIfFound = false,
    redirectTo = '/login',
    redirectAuthenticatedTo = '/dashboard'
  } = options;
  
  const router = useRouter();
  const { user, token, login, logout } = useAuthStore();
  
  useEffect(() => {
    // Redireciona para login se autenticação for obrigatória e usuário não estiver logado
    if (required && !user) {
      router.push(redirectTo);
    }
    
    // Redireciona para dashboard se usuário já estiver autenticado
    if (redirectIfFound && user) {
      router.push(redirectAuthenticatedTo);
    }
  }, [user, required, redirectIfFound, redirectTo, redirectAuthenticatedTo, router]);
  
  return { user, token, login, logout, isAuthenticated: !!user };
}
```

#### Proteção de Rotas

As rotas protegidas são gerenciadas pelo middleware do Next.js:

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  
  // Rotas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/livros', '/perfil', '/desafios', '/grupos'];
  
  // Rotas públicas apenas para visitantes não autenticados
  const guestOnlyRoutes = ['/login', '/cadastro'];
  
  // Verifica se é rota protegida e usuário não está autenticado
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verifica se é rota apenas para visitantes e usuário está autenticado
  if (guestOnlyRoutes.some(route => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/livros/:path*',
    '/perfil/:path*',
    '/desafios/:path*',
    '/grupos/:path*',
    '/login', 
    '/cadastro'
  ],
};
```

#### Fluxo de Autenticação

1. **Login tradicional**:
   - Usuário acessa a página de login (/login)
   - Insere credenciais (email/senha)
   - O frontend envia requisição para o backend (/api/auth/login)
   - Após validação, os tokens JWT (access e refresh) são armazenados no estado global
   - Usuário é redirecionado para o dashboard

2. **Login com Google**:
   - Usuário clica no botão "Entrar com Google"
   - É redirecionado para a página de autorização do Google
   - Após autorização, retorna para o callback configurado
   - O backend processa o código de autorização e gera tokens JWT
   - Os tokens são armazenados e o usuário é redirecionado para o dashboard

3. **Renovação automática de tokens**:
   - Quando o access token expira, o frontend utiliza o refresh token para obter um novo
   - Se a renovação falhar, o usuário é redirecionado para o login

4. **Proteção de rotas**:
   - Middleware verifica a presença e validade do token
   - Redireciona para o login se o token não existir ou for inválido
   - Redireciona para o dashboard se um usuário autenticado tentar acessar páginas públicas

### Componentes de UI

O frontend utiliza componentes da biblioteca shadcn/ui para uma interface consistente e acessível:

- Formulários com validação em tempo real
- Componentes de feedback (toast, alertas)
- Indicadores de carregamento
- Layout responsivo (mobile-first)
- Temas claro/escuro 