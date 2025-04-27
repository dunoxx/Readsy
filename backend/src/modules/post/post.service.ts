import { Injectable, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateReactionDto } from './dtos/create-reaction.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os posts (timeline pública) com paginação por cursor
  async findAll(limit = 10, cursor?: string) {
    // Validar o limite máximo de posts por requisição
    const take = Math.min(limit, 50);

    // Configurar condição para busca com cursor
    const cursorCondition = cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1, // Pular o próprio cursor
        }
      : {};

    // Buscar os posts
    const posts = await this.prisma.post.findMany({
      take,
      ...cursorCondition,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        reactions: {
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

    // Verificar se há mais posts
    const lastPost = posts[posts.length - 1];
    const nextCursor = lastPost?.id || null;
    
    // Verificar se há mais itens após o último carregado
    let hasNextPage = false;
    if (posts.length === take) {
      const nextItem = await this.prisma.post.findFirst({
        where: {
          createdAt: {
            lt: lastPost.createdAt,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: { id: true },
      });
      hasNextPage = !!nextItem;
    }

    return {
      data: posts,
      meta: {
        nextCursor,
        hasNextPage,
      },
    };
  }

  // Buscar posts de um usuário específico
  async findByUser(userId: string, limit = 10, cursor?: string) {
    // Validar o limite máximo de posts por requisição
    const take = Math.min(limit, 50);

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Configurar condição para busca com cursor
    const cursorCondition = cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1, // Pular o próprio cursor
        }
      : {};

    // Buscar os posts do usuário
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
      },
      take,
      ...cursorCondition,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        reactions: {
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

    // Verificar se há mais posts
    const lastPost = posts[posts.length - 1];
    const nextCursor = lastPost?.id || null;
    
    // Verificar se há mais itens após o último carregado
    let hasNextPage = false;
    if (posts.length === take) {
      const nextItem = await this.prisma.post.findFirst({
        where: {
          userId,
          createdAt: {
            lt: lastPost?.createdAt || new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: { id: true },
      });
      hasNextPage = !!nextItem;
    }

    return {
      data: posts,
      meta: {
        nextCursor,
        hasNextPage,
      },
    };
  }

  // Buscar post específico por ID
  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        reactions: {
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

    if (!post) {
      throw new NotFoundException(`Post com ID ${id} não encontrado`);
    }

    return post;
  }

  // Verificar limite de posts (anti-flood)
  async checkPostRateLimit(userId: string): Promise<boolean> {
    // Definir período de 30 minutos atrás
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Contar posts do usuário nos últimos 30 minutos
    const recentPostsCount = await this.prisma.post.count({
      where: {
        userId,
        createdAt: {
          gte: thirtyMinutesAgo,
        },
      },
    });
    
    // Verificar se o usuário já atingiu o limite de 3 posts
    return recentPostsCount < 3;
  }

  // Criar novo post
  async create(createPostDto: CreatePostDto, userId: string) {
    // Verificar limite de posts (anti-flood)
    const canPost = await this.checkPostRateLimit(userId);
    if (!canPost) {
      throw new HttpException(
        'Você atingiu o limite de 3 posts a cada 30 minutos.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return this.prisma.post.create({
      data: {
        content: createPostDto.content,
        isSpoiler: createPostDto.isSpoiler || false,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        reactions: true,
      },
    });
  }

  // Atualizar post
  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    // Verificar se o post existe
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o autor do post
    if (post.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este post');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        content: updatePostDto.content !== undefined ? updatePostDto.content : undefined,
        isSpoiler: updatePostDto.isSpoiler !== undefined ? updatePostDto.isSpoiler : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
        reactions: true,
      },
    });
  }

  // Remover post
  async remove(id: string, userId: string) {
    // Verificar se o post existe
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post com ID ${id} não encontrado`);
    }

    // Verificar se o usuário é o autor do post
    if (post.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir este post');
    }

    // Excluir reações associadas ao post
    await this.prisma.reaction.deleteMany({
      where: { postId: id },
    });

    // Excluir o post
    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post removido com sucesso' };
  }

  // Adicionar ou atualizar reação a um post
  async createOrUpdateReaction(postId: string, createReactionDto: CreateReactionDto, userId: string) {
    // Verificar se o post existe
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post com ID ${postId} não encontrado`);
    }

    // Verificar se o usuário já reagiu a este post
    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingReaction) {
      // Atualizar a reação existente
      return this.prisma.reaction.update({
        where: { id: existingReaction.id },
        data: {
          type: createReactionDto.type,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          post: true,
        },
      });
    } else {
      // Criar nova reação
      return this.prisma.reaction.create({
        data: {
          type: createReactionDto.type,
          user: {
            connect: { id: userId },
          },
          post: {
            connect: { id: postId },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          post: true,
        },
      });
    }
  }

  // Remover reação de um post
  async removeReaction(postId: string, userId: string) {
    // Verificar se o post existe
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post com ID ${postId} não encontrado`);
    }

    // Buscar a reação existente
    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingReaction) {
      throw new NotFoundException('Reação não encontrada para este post');
    }

    // Excluir a reação
    await this.prisma.reaction.delete({
      where: { id: existingReaction.id },
    });

    return { message: 'Reação removida com sucesso' };
  }
} 