import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  @IsOptional()
  backgroundPicture?: string;

  @IsISO8601()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(Language)
  @IsOptional()
  language?: Language;
} 