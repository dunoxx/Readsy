import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Buscar todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        backgroundPicture: true,
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Buscar usuário por ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        backgroundPicture: true,
        dateOfBirth: true, 
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  // Criar novo usuário
  async create(createUserDto: CreateUserDto) {
    // Verificar se já existe usuário com mesmo email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se username está em uso (se fornecido)
    if (createUserDto.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: createUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username já está em uso');
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Converter dateOfBirth de string para Date se existir
    const dateOfBirth = createUserDto.dateOfBirth 
      ? new Date(createUserDto.dateOfBirth)
      : undefined;

    // Criar usuário
    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        profilePicture: createUserDto.profilePicture,
        backgroundPicture: createUserDto.backgroundPicture,
        dateOfBirth,
        country: createUserDto.country,
        language: createUserDto.language,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        backgroundPicture: true,
        dateOfBirth: true,
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }

  // Atualizar usuário
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // Verificar se email já está em uso (se fornecido)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Verificar se username já está em uso (se fornecido)
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username já está em uso');
      }
    }

    // Hash da nova senha (se fornecida)
    let hashedPassword;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Converter dateOfBirth de string para Date se existir
    const dateOfBirth = updateUserDto.dateOfBirth 
      ? new Date(updateUserDto.dateOfBirth)
      : undefined;

    // Atualizar usuário
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: updateUserDto.email,
        password: hashedPassword,
        username: updateUserDto.username,
        displayName: updateUserDto.displayName,
        profilePicture: updateUserDto.profilePicture,
        backgroundPicture: updateUserDto.backgroundPicture,
        dateOfBirth,
        country: updateUserDto.country,
        language: updateUserDto.language,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        backgroundPicture: true,
        dateOfBirth: true,
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Deletar usuário
  async remove(id: string) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário removido com sucesso' };
  }
} 