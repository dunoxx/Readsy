import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpar o banco de dados
  await prisma.checkin.deleteMany({});
  await prisma.challengeBook.deleteMany({});
  await prisma.userChallenge.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.leaderboardEntry.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared');

  // Criar usuários
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@readsy.com',
      password: adminPassword,
      displayName: 'Administrador',
      username: 'admin',
      language: 'pt',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@readsy.com',
      password: userPassword,
      displayName: 'Usuário Teste',
      username: 'user',
      language: 'pt',
    },
  });

  console.log('Users created');

  // Criar alguns livros
  const book1 = await prisma.book.create({
    data: {
      title: 'O Hobbit',
      author: 'J.R.R. Tolkien',
      pages: 310,
      coverImage: 'https://m.media-amazon.com/images/I/91M9xPIf10L._AC_UF1000,1000_QL80_.jpg',
      createdBy: {
        connect: { id: admin.id },
      },
    },
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      pages: 256,
      coverImage: 'https://m.media-amazon.com/images/I/71UT9ZLyTTL._AC_UF1000,1000_QL80_.jpg',
      createdBy: {
        connect: { id: admin.id },
      },
    },
  });

  console.log('Books created');

  // Criar alguns grupos
  const group = await prisma.group.create({
    data: {
      name: 'Clube do Livro',
      description: 'Grupo para discussão de livros clássicos',
      owner: {
        connect: { id: admin.id },
      },
      members: {
        create: [
          {
            user: {
              connect: { id: admin.id },
            },
            role: 'OWNER',
          },
          {
            user: {
              connect: { id: user.id },
            },
            role: 'MEMBER',
          },
        ],
      },
    },
  });

  console.log('Groups created');

  // Criar alguns checkins
  await prisma.checkin.create({
    data: {
      user: {
        connect: { id: user.id },
      },
      book: {
        connect: { id: book1.id },
      },
      pagesRead: 50,
      minutesSpent: 60,
      currentPage: 50,
    },
  });

  await prisma.checkin.create({
    data: {
      user: {
        connect: { id: user.id },
      },
      book: {
        connect: { id: book2.id },
      },
      pagesRead: 30,
      minutesSpent: 45,
      currentPage: 30,
    },
  });

  console.log('Checkins created');

  // Criar um desafio
  const challenge = await prisma.challenge.create({
    data: {
      title: 'Desafio de Verão',
      description: 'Leia 5 livros durante o verão',
      type: 'PUBLIC',
      startDate: new Date('2023-12-21'),
      endDate: new Date('2024-03-20'),
      createdBy: {
        connect: { id: admin.id },
      },
      books: {
        create: [
          {
            book: {
              connect: { id: book1.id },
            },
          },
          {
            book: {
              connect: { id: book2.id },
            },
          },
        ],
      },
      participants: {
        create: [
          {
            user: {
              connect: { id: user.id },
            },
            progress: 1,
          },
        ],
      },
    },
  });

  console.log('Challenges created');

  // Criar algumas entradas de leaderboard
  await prisma.leaderboardEntry.create({
    data: {
      user: {
        connect: { id: user.id },
      },
      score: 100,
      season: '2023-winter',
    },
  });

  console.log('Leaderboard entries created');

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 