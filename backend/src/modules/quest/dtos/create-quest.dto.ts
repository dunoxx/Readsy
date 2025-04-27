import { IsString, IsInt, IsEnum, IsBoolean, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestType } from '../../gamification/dto/quest-type.enum';

export class CreateQuestDto {
  @ApiProperty({
    description: 'Título da quest',
    example: 'Ler 30 páginas',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição da quest',
    example: 'Leia pelo menos 30 páginas hoje para ganhar XP e moedas',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Tipo da quest',
    enum: QuestType,
    example: QuestType.READ_PAGES,
  })
  @IsNotEmpty()
  @IsEnum(QuestType)
  questType: QuestType;

  @ApiProperty({
    description: 'Valor alvo para completar a quest',
    example: 30,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  valueTarget: number;

  @ApiProperty({
    description: 'Quantidade de XP como recompensa',
    example: 50,
    minimum: 10,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(10)
  xpReward: number;

  @ApiProperty({
    description: 'Quantidade de moedas como recompensa',
    example: 5,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  coinReward?: number = 0;

  @ApiProperty({
    description: 'Emoji representativo da quest',
    example: '📚',
    default: '🎯',
  })
  @IsOptional()
  @IsString()
  emoji?: string = '🎯';

  @ApiProperty({
    description: 'Indica se a quest é diária (true) ou semanal (false)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isDaily?: boolean = true;
} 