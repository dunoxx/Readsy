import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCheckinDto {
  @IsString()
  bookId: string;

  @IsInt()
  @Min(1)
  pagesRead: number;

  @IsInt()
  @Min(1)
  currentPage: number;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  audioNoteUrl?: string;
} 