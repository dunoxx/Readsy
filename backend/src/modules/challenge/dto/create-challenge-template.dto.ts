import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum, IsObject, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Definição manual da enumeração TemplateType conforme schema.prisma
export enum TemplateType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SPECIAL = 'SPECIAL',
}

export class CreateChallengeTemplateDto {
  @ApiProperty({
    description: 'Nome do desafio',
    example: 'Leia um livro em 7 dias',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição do desafio',
    example: 'Complete a leitura de qualquer livro em até 7 dias',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Ícone do desafio (emoji)',
    example: '🏆',
    default: '🎯',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Quantidade de XP como recompensa do desafio',
    example: 50,
    enum: [10, 20, 30, 50, 80, 130, 210, 340, 550],
  })
  @IsNotEmpty()
  @IsInt()
  @IsIn([10, 20, 30, 50, 80, 130, 210, 340, 550])
  baseXpReward: number;

  @ApiProperty({
    description: 'Quantidade de Coins como recompensa do desafio',
    example: 5,
    enum: [0, 5, 10, 15, 25, 30],
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 5, 10, 15, 25, 30])
  baseCoinsReward?: number;

  @ApiProperty({
    description: 'Tipo do desafio',
    enum: TemplateType,
    example: TemplateType.DAILY,
  })
  @IsNotEmpty()
  @IsEnum(TemplateType)
  type: TemplateType;

  @ApiProperty({
    description: 'Requisitos para completar o desafio',
    example: {
      pagesRead: 100,
      booksCompleted: 1,
      timeSpent: 120, // em minutos
    },
  })
  @IsNotEmpty()
  @IsObject()
  requirements: Record<string, any>;
} 