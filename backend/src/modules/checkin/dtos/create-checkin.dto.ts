import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCheckinDto {
  @IsUUID()
  bookId: string;

  @IsInt()
  @Min(1)
  pagesRead: number;

  @IsInt()
  @Min(1)
  minutesSpent: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  currentPage?: number;

  @IsString()
  @IsOptional()
  audioNoteUrl?: string;
} 