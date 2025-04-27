import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @ApiProperty({
    description: 'Tipo de reação',
    example: 'LIKE',
    enum: ['LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY'],
  })
  @IsString()
  @IsIn(['LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY'])
  type: string;
} 