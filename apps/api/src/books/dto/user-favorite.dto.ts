import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateUserFavoriteDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

export class UpdateUserFavoriteDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

export class UserFavoriteResponseDto {
  id: string;
  userId: string;
  bookId: string;
  rating?: number;
  read: boolean;
  createdAt: Date;
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string;

    coverUrl?: string;
    category?: string;
    totalPages: number;
  };
} 