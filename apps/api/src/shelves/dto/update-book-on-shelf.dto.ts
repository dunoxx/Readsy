import { IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateBookOnShelfDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsNumber()
  rating?: number;
} 