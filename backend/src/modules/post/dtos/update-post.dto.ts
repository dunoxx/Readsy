import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    description: 'Conteúdo do post',
    example: 'Acabei de terminar de ler "O Senhor dos Anéis" e foi incrível!',
    minLength: 1,
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'O conteúdo não pode estar vazio' })
  @MaxLength(500, { message: 'O conteúdo não pode exceder 500 caracteres' })
  content?: string;

  @ApiProperty({
    description: 'Indica se o post contém spoilers',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSpoiler?: boolean;
} 