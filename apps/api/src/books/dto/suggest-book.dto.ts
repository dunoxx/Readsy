import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class SuggestBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalPages?: number;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
} 