import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

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