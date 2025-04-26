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

## Próximos Passos

- Implementação de autenticação JWT/OAuth2
- Implementação de upload de imagens
- Desenvolvimento do frontend
- Integração com APIs externas (OpenLibrary, Google Books)
- Monetização via Stripe 