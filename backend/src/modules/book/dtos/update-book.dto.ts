import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiProperty({
    description: 'Título do livro',
    example: 'Dom Casmurro',
    required: false
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Autor do livro',
    example: 'Machado de Assis',
    required: false
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: 'URL da imagem de capa do livro',
    example: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({
    description: 'ISBN do livro (ISBN-13 preferencialmente)',
    example: '9788574801711',
    required: false
  })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({
    description: 'Número de páginas do livro',
    example: 256,
    required: false
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  pages?: number;

  @ApiProperty({
    description: 'Ano de publicação do livro',
    example: '1899',
    required: false
  })
  @IsString()
  @IsOptional()
  publishedDate?: string;

  @ApiProperty({
    description: 'Resumo/sinopse do livro',
    example: 'Romance que narra a história de Bentinho e Capitu...',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Nome da editora',
    example: 'Companhia das Letras',
    required: false
  })
  @IsString()
  @IsOptional()
  publisher?: string;

  @ApiProperty({
    description: 'Código do idioma (ex: pt, en, es)',
    example: 'pt',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;
} 