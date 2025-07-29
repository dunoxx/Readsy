import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class ReorderBooksDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  bookIds: string[];
} 