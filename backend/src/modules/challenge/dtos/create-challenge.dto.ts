import { IsArray, IsDateString, IsEnum, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum ChallengeType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

class ChallengeBookDto {
  @IsUUID()
  bookId: string;
}

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ChallengeType)
  type: ChallengeType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChallengeBookDto)
  books: ChallengeBookDto[];
} 