import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestType } from '@prisma/client';

export enum ChallengeFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export class CreateGroupChallengeDto {
  @ApiProperty({
    description: 'Título do desafio',
    example: 'Ler 100 páginas em uma semana'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição do desafio',
    example: 'Desafio para incentivar a leitura consistente',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tipo de desafio',
    enum: QuestType,
    example: 'READ_PAGES'
  })
  @IsEnum(QuestType)
  type: QuestType;

  @ApiProperty({
    description: 'Meta do desafio (ex: número de páginas, dias de check-in)',
    example: 100
  })
  @IsInt()
  @Min(1)
  target: number;

  @ApiProperty({
    description: 'ID do livro (obrigatório apenas para desafios de leitura de livro)',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    required: false
  })
  @IsUUID()
  @IsOptional()
  bookId?: string;

  @ApiProperty({
    description: 'Pontos de recompensa ao completar o desafio',
    example: 100
  })
  @IsInt()
  @Min(1)
  pointsReward: number;

  @ApiProperty({
    description: 'Frequência do desafio',
    enum: ChallengeFrequency,
    example: ChallengeFrequency.DAILY
  })
  @IsEnum(ChallengeFrequency)
  frequency: ChallengeFrequency;

  @ApiProperty({
    description: 'Data de término do desafio',
    example: '2024-08-01T00:00:00Z'
  })
  @IsString()
  endDate: string;
} 