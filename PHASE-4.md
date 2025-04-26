# Fase 4 - Readsy: Implementação do Frontend de Autenticação

## Visão Geral

Na quarta fase do projeto Readsy, foi implementado o frontend de autenticação utilizando Next.js com App Router. Isso inclui páginas de login e cadastro, integração com Google OAuth, gerenciamento de sessão com Zustand e proteção de rotas para usuários autenticados.

## Implementações Realizadas

### 1. Gerenciamento de Estado

Foi implementado um store com Zustand para gerenciar o estado de autenticação:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Métodos de autenticação...
    }),
    {
      name: 'readsy-auth-storage', // nome para o localStorage
    }
  )
);
```

### 2. Páginas de Autenticação

#### Login

A página de login (`/login`) contém:
- Formulário com campos para email e senha
- Validação de formulário com Zod
- Botão para login com Google
- Tratamento de erros com mensagens amigáveis
- Feedback visual durante o processo de login

#### Cadastro

A página de cadastro (`/signup`) contém:
- Formulário com campos para nome, email e senha
- Validação de campos com restrições específicas
- Botão para cadastro com Google
- Feedback visual durante o processo de cadastro

### 3. Integração com APIs de Autenticação

- Conexão com APIs do backend via Axios
- Interceptores para renovação automática de tokens
- Tratamento de erros de autenticação

### 4. Proteção de Rotas

A proteção de rotas foi implementada de duas formas:

**1. Middleware do Next.js:**
```typescript
export function middleware(request: NextRequest) {
  // Verificação de autenticação e redirecionamento
}
```

**2. Hook useAuth:**
```typescript
export function useAuth({
  required = false,
  redirectTo = '/login',
  // ...
}) {
  // Lógica de verificação de autenticação
}
```

### 5. Componentes de UI

- **Header**: Cabeçalho da aplicação com menu de usuário e botão de logout
- **GoogleButton**: Botão customizado para login com Google
- **Form Components**: Componentes de formulário com validação e feedback visual

## Fluxo de Autenticação

### Login Tradicional (Email/Senha)

1. Usuário acessa a página de login
2. Preenche email e senha
3. O sistema valida os dados e envia para o backend
4. Em caso de sucesso, armazena tokens e redireciona para o dashboard
5. Em caso de erro, exibe mensagem amigável

### Login com Google

1. Usuário clica no botão "Entrar com Google"
2. É redirecionado para a página de autenticação do Google
3. Após autenticação bem-sucedida, o Google redireciona de volta para `/auth/callback`
4. A página de callback processa o código de autorização e obtém os tokens
5. Armazena os tokens e redireciona para o dashboard

### Sessão e Tokens

- **Access Token**: Usado para acessar APIs protegidas (duração curta)
- **Refresh Token**: Usado para renovar o access token quando expirar (duração longa)
- Renovação automática de tokens via interceptors do Axios

## Páginas Protegidas

As seguintes páginas são protegidas e só podem ser acessadas por usuários autenticados:

- `/dashboard`: Painel principal do usuário
- `/books`: Gerenciamento de livros
- `/profile`: Perfil do usuário
- `/challenges`: Desafios de leitura
- `/groups`: Grupos de leitura

## Próximos Passos (Fase 5)

- Implementação das páginas de gerenciamento de livros
- Sistema de registro de checkins de leitura
- Implementação de desafios e grupos de leitura
- Sistema de leaderboards e gamificação
- Melhorias de UX/UI e animações 