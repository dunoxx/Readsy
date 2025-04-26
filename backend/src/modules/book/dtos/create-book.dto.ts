import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  pages?: number;
} 