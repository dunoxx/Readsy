import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateReactionDto } from './dtos/create-reaction.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os posts (timeline pública)
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const take = limit;

    const posts = await this.prisma.post.findMany({
      skip,
      take,
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

    const totalPosts = await this.prisma.post.count();

    return {
      data: posts,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
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

  // Criar novo post
  async create(createPostDto: CreatePostDto, userId: string) {
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