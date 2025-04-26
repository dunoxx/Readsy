# Fase 2 - Readsy: Implementação de Modelos e APIs

## Visão Geral

Na segunda fase do projeto Readsy, foram implementados os modelos iniciais da aplicação e as APIs essenciais para operações CRUD. Esta fase estabelece a fundação do backend da aplicação utilizando NestJS, Prisma ORM e PostgreSQL.

## Modelos de Dados

Os seguintes modelos foram criados utilizando Prisma Schema:

### User
```prisma
model User {
  id                String            @id @default(uuid())
  email             String            @unique
  password          String?
  username          String?           @unique
  displayName       String
  profilePicture    String?
  backgroundPicture String?
  dateOfBirth       DateTime?
  country           String?
  language          Language          @default(pt)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  books             Book[]
  checkins          Checkin[]
  ownedGroups       Group[]
  groupMembers      GroupMember[]
  createdChallenges Challenge[]
  userChallenges    UserChallenge[]
  leaderboardEntries LeaderboardEntry[]
}
```

### Book
```prisma
model Book {
  id          String     @id @default(uuid())
  title       String
  author      String
  coverImage  String?
  isbn        String?
  pages       Int?
  createdAt   DateTime   @default(now())
  createdBy   User       @relation(fields: [createdById], references: [id])
  createdById String
  checkins    Checkin[]
  challenges  ChallengeBook[]
}
```

### Group
```prisma
model Group {
  id          String        @id @default(uuid())
  name        String
  description String?
  owner       User          @relation(fields: [ownerId], references: [id])
  ownerId     String
  createdAt   DateTime      @default(now())
  members     GroupMember[]
}
```

### Checkin
```prisma
model Checkin {
  id          String   @id @default(uuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  book        Book     @relation(fields: [bookId], references: [id])
  bookId      String
  pagesRead   Int
  minutesSpent Int
  currentPage Int?
  audioNoteUrl String?
  createdAt   DateTime @default(now())
}
```

### Challenge
```prisma
model Challenge {
  id          String           @id @default(uuid())
  title       String
  description String
  type        ChallengeType
  createdBy   User             @relation(fields: [createdById], references: [id])
  createdById String
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime         @default(now())
  books       ChallengeBook[]
  participants UserChallenge[]
}
```

### LeaderboardEntry
```prisma
model LeaderboardEntry {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  score     Int
  season    String
  createdAt DateTime @default(now())
}
```

## APIs Implementadas

### Users API
- **GET /api/users**: Listar todos os usuários
- **GET /api/users/:id**: Buscar usuário por ID
- **POST /api/users**: Criar novo usuário
- **PATCH /api/users/:id**: Atualizar usuário
- **DELETE /api/users/:id**: Remover usuário

### Books API
- **GET /api/books**: Listar todos os livros
- **GET /api/books/:id**: Buscar livro por ID
- **POST /api/books**: Criar novo livro
- **PATCH /api/books/:id**: Atualizar livro
- **DELETE /api/books/:id**: Remover livro

### Checkins API
- **GET /api/checkins**: Listar todos os checkins
- **GET /api/checkins/user/:userId**: Buscar checkins de um usuário
- **GET /api/checkins/:id**: Buscar checkin por ID
- **POST /api/checkins/user/:userId**: Criar novo checkin
- **DELETE /api/checkins/:id**: Remover checkin

## Validação e Tratamento de Erros

Todas as entradas de dados são validadas utilizando o pacote `class-validator` com DTOs específicos para cada operação. Os erros são tratados globalmente com o uso do `ValidationPipe` do NestJS.

Exemplos de validação implementada:

```typescript
export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  pages?: number;
}
```

## Documentação

A documentação da API foi implementada utilizando Swagger UI e está disponível em `/api/docs`. Todas as rotas foram devidamente documentadas com descrições, parâmetros esperados e possíveis respostas.

O arquivo README principal foi atualizado com exemplos de uso e informações sobre a API.

## Configuração e Testes

### Configuração Inicial

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/readsy.git
   cd readsy
   ```

2. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```

3. Configure o arquivo `.env` com as variáveis de ambiente:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/readsy?schema=public"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

4. Inicie os serviços Docker:
   ```bash
   docker-compose up -d
   ```

5. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```

6. Popule o banco de dados com dados iniciais:
   ```bash
   npm run seed
   ```

7. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

### Testando as APIs

#### Usando curl:

1. Listar usuários:
   ```bash
   curl -X GET http://localhost:3001/api/users
   ```

2. Criar um livro:
   ```bash
   curl -X POST http://localhost:3001/api/books \
     -H "Content-Type: application/json" \
     -d '{"title":"Dom Casmurro","author":"Machado de Assis","pages":256}'
   ```

3. Registrar um checkin:
   ```bash
   curl -X POST http://localhost:3001/api/checkins/user/USER_ID \
     -H "Content-Type: application/json" \
     -d '{"bookId":"BOOK_ID","pagesRead":50,"minutesSpent":45}'
   ```

#### Usando Swagger:

Acesse http://localhost:3001/api/docs para utilizar a interface interativa do Swagger.

## Próximos Passos (Fase 3)

- Implementação de autenticação JWT
- Integração com OAuth2 (Google, Facebook)
- Proteção de rotas com Guards
- Upload de imagens (perfil, capa de livros)
- Desenvolvimento do frontend em Next.js 