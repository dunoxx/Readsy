import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  isbn?: string;



  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalPages?: number;

  @IsOptional()
  @IsString()
  amazonAffiliateUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;
} 