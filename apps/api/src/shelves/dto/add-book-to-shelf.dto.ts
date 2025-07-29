import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class AddBookToShelfDto {
  @IsString()
  bookId: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsNumber()
  rating?: number;
} 