import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os desafios
  async findAll() {
    return this.prisma.challenge.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        books: {
          include: {
            book: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  // Buscar desafios públicos
  async findPublic() {
    return this.prisma.challenge.findMany({
      where: {
        type: 'PUBLIC',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        books: {
          include: {
            book: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  // Buscar desafios criados por um usuário
  async findByCreator(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.challenge.findMany({
      where: {
        createdById: userId,
      },
      include: {
        books: {
          include: {
            book: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  // Buscar desafios em que um usuário participa
  async findByParticipant(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    return this.prisma.userChallenge.findMany({
      where: {
        userId,
      },
      include: {
        challenge: {
          include: {
            books: {
              include: {
                book: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  // Buscar desafio por ID
  async findOne(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        books: {
          include: {
            book: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${id} não encontrado`);
    }

    return challenge;
  }

  // Criar novo desafio
  async create(createChallengeDto: CreateChallengeDto, userId: string) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se as datas são válidas
    const startDate = new Date(createChallengeDto.startDate);
    const endDate = new Date(createChallengeDto.endDate);
    const now = new Date();

    if (startDate < now) {
      throw new BadRequestException('A data de início não pode ser anterior à data atual');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('A data de término deve ser posterior à data de início');
    }

    // Verificar se os livros existem
    for (const book of createChallengeDto.books) {
      const bookExists = await this.prisma.book.findUnique({
        where: { id: book.bookId },
      });

      if (!bookExists) {
        throw new NotFoundException(`Livro com ID ${book.bookId} não encontrado`);
      }
    }

    // Criar o desafio e seus relacionamentos
    return this.prisma.challenge.create({
      data: {
        title: createChallengeDto.title,
        description: createChallengeDto.description,
        type: createChallengeDto.type,
        startDate,
        endDate,
        createdBy: {
          connect: { id: userId },
        },
        books: {
          create: createChallengeDto.books.map(book => ({
            book: {
              connect: { id: book.bookId },
            },
          })),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        books: {
          include: {
            book: true,
          },
        },
      },
    });
  }

  // Atualizar desafio
  async update(id: string, updateChallengeDto: UpdateChallengeDto, userId: string) {
    // Verificar se o desafio existe
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o criador do desafio
    if (challenge.createdById !== userId) {
      throw new BadRequestException('Apenas o criador do desafio pode atualizá-lo');
    }

    // Verificar se as datas são válidas quando fornecidas
    if (updateChallengeDto.startDate && updateChallengeDto.endDate) {
      const startDate = new Date(updateChallengeDto.startDate);
      const endDate = new Date(updateChallengeDto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('A data de término deve ser posterior à data de início');
      }
    } else if (updateChallengeDto.startDate) {
      const startDate = new Date(updateChallengeDto.startDate);
      const endDate = challenge.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('A data de término deve ser posterior à data de início');
      }
    } else if (updateChallengeDto.endDate) {
      const startDate = challenge.startDate;
      const endDate = new Date(updateChallengeDto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('A data de término deve ser posterior à data de início');
      }
    }

    // Preparar os dados para atualização
    const updateData: any = {
      title: updateChallengeDto.title,
      description: updateChallengeDto.description,
      type: updateChallengeDto.type,
      startDate: updateChallengeDto.startDate ? new Date(updateChallengeDto.startDate) : undefined,
      endDate: updateChallengeDto.endDate ? new Date(updateChallengeDto.endDate) : undefined,
    };

    // Atualizar os livros do desafio, se fornecidos
    if (updateChallengeDto.books && updateChallengeDto.books.length > 0) {
      // Verificar se os livros existem
      for (const book of updateChallengeDto.books) {
        const bookExists = await this.prisma.book.findUnique({
          where: { id: book.bookId },
        });

        if (!bookExists) {
          throw new NotFoundException(`Livro com ID ${book.bookId} não encontrado`);
        }
      }

      // Remover os livros existentes e adicionar os novos
      await this.prisma.challengeBook.deleteMany({
        where: {
          challengeId: id,
        },
      });

      // Criar as novas relações
      for (const book of updateChallengeDto.books) {
        await this.prisma.challengeBook.create({
          data: {
            challenge: {
              connect: { id },
            },
            book: {
              connect: { id: book.bookId },
            },
          },
        });
      }
    }

    // Atualizar o desafio
    return this.prisma.challenge.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        books: {
          include: {
            book: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  // Remover desafio
  async remove(id: string, userId: string) {
    // Verificar se o desafio existe
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o criador do desafio
    if (challenge.createdById !== userId) {
      throw new BadRequestException('Apenas o criador do desafio pode removê-lo');
    }

    // Remover todas as relações primeiro
    await this.prisma.challengeBook.deleteMany({
      where: { challengeId: id },
    });

    await this.prisma.userChallenge.deleteMany({
      where: { challengeId: id },
    });

    // Remover o desafio
    await this.prisma.challenge.delete({
      where: { id },
    });

    return { message: 'Desafio removido com sucesso' };
  }

  // Participar de um desafio
  async joinChallenge(challengeId: string, userId: string) {
    // Verificar se o desafio existe
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${challengeId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário já participa do desafio
    const existingParticipation = await this.prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    if (existingParticipation) {
      throw new BadRequestException('Usuário já participa deste desafio');
    }

    // Adicionar o usuário como participante
    return this.prisma.userChallenge.create({
      data: {
        user: {
          connect: { id: userId },
        },
        challenge: {
          connect: { id: challengeId },
        },
        progress: 0,
        completed: false,
      },
      include: {
        challenge: {
          include: {
            books: {
              include: {
                book: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  // Sair de um desafio
  async leaveChallenge(challengeId: string, userId: string) {
    // Verificar se o desafio existe
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${challengeId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário participa do desafio
    const participation = await this.prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    if (!participation) {
      throw new BadRequestException('Usuário não participa deste desafio');
    }

    // Remover a participação
    await this.prisma.userChallenge.delete({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    return { message: 'Participação no desafio removida com sucesso' };
  }

  // Atualizar progresso em um desafio
  async updateProgress(challengeId: string, userId: string, progress: number) {
    // Verificar se o desafio existe
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        books: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Desafio com ID ${challengeId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário participa do desafio
    const participation = await this.prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    if (!participation) {
      throw new BadRequestException('Usuário não participa deste desafio');
    }

    // Verificar se o progresso é válido
    const booksCount = challenge.books.length;
    if (progress < 0 || progress > booksCount) {
      throw new BadRequestException(`O progresso deve estar entre 0 e ${booksCount}`);
    }

    // Verificar se o desafio foi concluído
    const completed = progress === booksCount;
    const completedAt = completed ? new Date() : null;

    // Atualizar o progresso
    return this.prisma.userChallenge.update({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      data: {
        progress,
        completed,
        completedAt,
      },
      include: {
        challenge: {
          include: {
            books: {
              include: {
                book: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }
} 