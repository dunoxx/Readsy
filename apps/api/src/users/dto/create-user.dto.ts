import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email = '';

  @IsString()
  @MinLength(6)
  password = '';

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username = '';

  @IsString()
  @MinLength(2)
  displayName = '';

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  frame?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @IsString()
  languageId?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
} 