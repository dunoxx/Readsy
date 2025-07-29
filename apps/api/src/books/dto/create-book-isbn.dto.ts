import { IsString } from 'class-validator';

export class CreateBookIsbnDto {
  @IsString()
  isbn: string;
} 