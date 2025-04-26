import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddXpDto {
  @ApiProperty({
    description: 'ID do usuário que receberá o XP',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Quantidade de XP a ser adicionada',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  xpAmount: number;
} 