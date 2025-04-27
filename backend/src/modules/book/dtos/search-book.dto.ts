import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchBookDto {
  @ApiProperty({
    description: 'Termo de busca (título do livro ou ISBN)',
    example: 'Dom Casmurro',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  query: string;
} 