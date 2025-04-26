import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum ChallengeType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

class ChallengeBookDto {
  @IsUUID()
  bookId: string;
}

export class UpdateChallengeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ChallengeType)
  @IsOptional()
  type?: ChallengeType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChallengeBookDto)
  @IsOptional()
  books?: ChallengeBookDto[];
} 