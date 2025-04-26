import { IsNotEmpty, IsString, IsOptional, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeeklyQuestDto {
  @ApiProperty({
    description: 'Título da missão semanal',
    example: 'Complete um livro esta semana',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição da missão semanal',
    example: 'Termine a leitura de um livro completo até o final da semana',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Emoji representativo da missão',
    example: '📚',
    default: '🎯',
  })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiProperty({
    description: 'Quantidade de XP como recompensa da missão',
    example: 130,
    enum: [10, 20, 30, 50, 80, 130, 210, 340, 550],
  })
  @IsNotEmpty()
  @IsInt()
  @IsIn([10, 20, 30, 50, 80, 130, 210, 340, 550])
  baseXpReward: number;

  @ApiProperty({
    description: 'Quantidade de Coins como recompensa da missão',
    example: 5,
    default: 2,
    minimum: 2,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  baseCoinReward?: number;
} 