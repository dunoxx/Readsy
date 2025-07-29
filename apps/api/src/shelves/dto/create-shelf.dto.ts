import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateShelfDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isWishlist?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
} 