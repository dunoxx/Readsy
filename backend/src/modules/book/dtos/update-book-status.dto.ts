import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Precisamos definir o enum aqui também para usar no DTO
export enum BookStatus {
  READING = 'READING',
  FINISHED = 'FINISHED',
  ABANDONED = 'ABANDONED',
  PLANNING = 'PLANNING',
}

export class UpdateBookStatusDto {
  @ApiProperty({
    description: 'Status do livro',
    enum: BookStatus,
    example: BookStatus.READING,
  })
  @IsNotEmpty()
  @IsEnum(BookStatus)
  status: BookStatus;
} 