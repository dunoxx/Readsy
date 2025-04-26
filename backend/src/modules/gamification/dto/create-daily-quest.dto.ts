import { IsNotEmpty, IsString, IsOptional, IsInt, IsIn, Min, Max, IsEnum, IsObject, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestType } from './quest-type.enum';

export class CreateDailyQuestDto {
  @ApiProperty({
    description: 'Título da missão diária',
    example: 'Leia por 30 minutos hoje',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição da missão diária',
    example: 'Complete uma sessão de leitura de pelo menos 30 minutos',
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
    description: 'Tipo da missão',
    enum: QuestType,
    example: QuestType.READ_PAGES,
  })
  @IsNotEmpty()
  @IsEnum(QuestType)
  questType: QuestType;

  @ApiProperty({
    description: 'Parâmetros específicos do tipo de missão',
    example: { pages: 50 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateIf(o => o.questType !== QuestType.CHECKIN_DAY)
  @Type(() => Object)
  parameters?: Record<string, any>;

  @ApiProperty({
    description: 'Quantidade de XP como recompensa da missão',
    example: 50,
    enum: [10, 20, 30, 50, 80, 130, 210, 340, 550],
  })
  @IsNotEmpty()
  @IsInt()
  @IsIn([10, 20, 30, 50, 80, 130, 210, 340, 550])
  baseXpReward: number;

  @ApiProperty({
    description: 'Quantidade de Coins como recompensa da missão',
    example: 1,
    default: 0,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  baseCoinReward?: number;
} 