import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { CreateChallengeTemplateDto, TemplateType } from './dto/create-challenge-template.dto';
import { GamificationService } from '../gamification/gamification.service';
import { AchievementsService } from '../gamification/achievements.service';

@Injectable()
export class ChallengeService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private achievementsService: AchievementsService,
  ) {}

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
    
    // Verificar se este é um novo progresso (desafio sendo completado agora)
    const isNewlyCompleted = completed && !participation.completed;

    // Atualizar o progresso
    const updatedParticipation = await this.prisma.userChallenge.update({
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

    // Se o desafio foi completado agora, recompensar o usuário
    if (isNewlyCompleted) {
      // Calcular recompensa de XP (base + bônus por livros)
      const baseXp = 100;
      const xpPerBook = 50;
      const totalXp = baseXp + (booksCount * xpPerBook);
      
      // Conceder XP
      await this.gamificationService.addXp(userId, totalXp);
      
      // Verificar conquistas de desafios
      await this.achievementsService.checkChallengeAchievements(userId);
      
      // Adicionar informações de gamificação ao resultado
      return {
        ...updatedParticipation,
        gamification: {
          xpEarned: totalXp,
          message: 'Parabéns! Você completou o desafio e ganhou XP!',
        },
      };
    }

    return updatedParticipation;
  }

  // Criar um novo modelo de desafio global
  async createChallengeTemplate(createChallengeTemplateDto: CreateChallengeTemplateDto) {
    return this.prisma.challengeTemplate.create({
      data: {
        name: createChallengeTemplateDto.name,
        description: createChallengeTemplateDto.description,
        icon: createChallengeTemplateDto.icon || '🎯',
        baseXpReward: createChallengeTemplateDto.baseXpReward,
        baseCoinsReward: createChallengeTemplateDto.baseCoinsReward || 0,
        type: createChallengeTemplateDto.type,
        requirements: createChallengeTemplateDto.requirements,
      },
    });
  }

  // Obter todos os modelos de desafios globais
  async getAllChallengeTemplates() {
    return this.prisma.challengeTemplate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obter modelos de desafios globais por tipo
  async getChallengeTemplatesByType(type: TemplateType) {
    return this.prisma.challengeTemplate.findMany({
      where: {
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obter um modelo de desafio global por ID
  async getChallengeTemplateById(id: string) {
    const template = await this.prisma.challengeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Modelo de desafio com ID ${id} não encontrado`);
    }

    return template;
  }

  // Criar um desafio de grupo baseado em um modelo global
  async createGroupChallengeFromTemplate(
    groupId: string,
    templateId: string,
    createdBy: string,
    endDate: Date,
  ) {
    // Verificar se o grupo existe
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: {
            userId: createdBy,
            role: {
              in: ['OWNER', 'ADMIN'],
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verificar se o usuário é dono ou admin do grupo
    if (group.members.length === 0) {
      throw new BadRequestException('Você não tem permissão para criar desafios neste grupo');
    }

    // Verificar se o modelo de desafio existe
    const template = await this.prisma.challengeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Modelo de desafio com ID ${templateId} não encontrado`);
    }

    // Criar o desafio do grupo
    return this.prisma.groupChallenge.create({
      data: {
        group: {
          connect: { id: groupId },
        },
        challengeTemplate: {
          connect: { id: templateId },
        },
        createdBy,
        endDate,
        xpReward: template.baseXpReward,
      },
      include: {
        group: true,
        challengeTemplate: true,
      },
    });
  }

  // Completar um desafio de grupo
  async completeGroupChallenge(
    groupChallengeId: string,
    userId: string,
  ) {
    // Verificar se o desafio de grupo existe
    const groupChallenge = await this.prisma.groupChallenge.findUnique({
      where: { id: groupChallengeId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId,
              },
            },
          },
        },
        challengeTemplate: true,
      },
    });

    if (!groupChallenge) {
      throw new NotFoundException(`Desafio de grupo com ID ${groupChallengeId} não encontrado`);
    }

    // Verificar se o usuário é membro do grupo
    if (groupChallenge.group.members.length === 0) {
      throw new BadRequestException('Você não é membro do grupo deste desafio');
    }

    // Verificar se o usuário já completou o desafio
    const existingCompletion = await this.prisma.userGroupChallenge.findUnique({
      where: {
        userId_groupChallengeId: {
          userId,
          groupChallengeId,
        },
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('Você já completou este desafio');
    }

    // Registrar a conclusão
    const completion = await this.prisma.userGroupChallenge.create({
      data: {
        userId,
        groupChallengeId,
        xpEarned: groupChallenge.xpReward,
      },
      include: {
        groupChallenge: {
          include: {
            challengeTemplate: true,
            group: true,
          },
        },
      },
    });

    // Conceder XP ao usuário
    await this.gamificationService.addXp(userId, groupChallenge.xpReward);
    
    // Verificar conquistas de desafios
    await this.achievementsService.checkChallengeAchievements(userId);

    return {
      ...completion,
      gamification: {
        xpEarned: groupChallenge.xpReward,
        message: 'Parabéns! Você completou o desafio do grupo e ganhou XP!',
      },
    };
  }

  // Completar um desafio global
  async completeGlobalChallenge(
    templateId: string,
    userId: string,
  ) {
    // Verificar se o modelo de desafio existe
    const template = await this.prisma.challengeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Modelo de desafio com ID ${templateId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Verificar se o usuário já completou este desafio global
    const existingCompletion = await this.prisma.userGlobalChallenge.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId,
        },
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('Você já completou este desafio global');
    }

    // Criar o registro de conclusão
    const completion = await this.prisma.userGlobalChallenge.create({
      data: {
        user: {
          connect: { id: userId },
        },
        template: {
          connect: { id: templateId },
        },
        xpEarned: template.baseXpReward,
        coinsEarned: template.baseCoinsReward,
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    // Conceder XP e moedas ao usuário
    await this.gamificationService.addXp(userId, template.baseXpReward);
    
    // Atualizar moedas do usuário
    if (template.baseCoinsReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: template.baseCoinsReward },
        },
      });
    }
    
    // Verificar conquistas de desafios
    await this.achievementsService.checkChallengeAchievements(userId);

    return {
      ...completion,
      gamification: {
        xpEarned: template.baseXpReward,
        coinsEarned: template.baseCoinsReward,
        message: 'Parabéns! Você completou o desafio global e ganhou recompensas!',
      },
    };
  }
} 