import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateQuestProgressDto {
  @ApiProperty({
    description: 'Progresso a ser incrementado na quest',
    example: 5,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  progressIncrement: number;
} 