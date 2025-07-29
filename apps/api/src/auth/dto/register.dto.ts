import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @IsString()
  @MinLength(2)
  displayName: string;
} 