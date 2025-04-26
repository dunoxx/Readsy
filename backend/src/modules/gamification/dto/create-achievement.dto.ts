import { IsString, IsInt, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAchievementDto {
  @ApiProperty({
    description: 'Nome da conquista',
    example: 'Leitor Ávido',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição da conquista',
    example: 'Leia 1000 páginas de livros',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Emoji ou ícone da conquista',
    example: '📚',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Valor a ser atingido para completar a conquista',
    example: 1000,
  })
  @IsInt()
  @Min(1)
  goal: number;

  @ApiProperty({
    description: 'Quantidade de XP concedida ao completar a conquista',
    example: 100,
  })
  @IsInt()
  @Min(0)
  xpReward: number;

  @ApiProperty({
    description: 'Quantidade de moedas concedidas ao completar a conquista',
    example: 10,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  coinsReward?: number;

  @ApiProperty({
    description: 'ID do badge a ser concedido ao completar a conquista',
    example: 'uuid-do-badge',
    required: false,
  })
  @IsString()
  @IsOptional()
  badgeReward?: string;
} 