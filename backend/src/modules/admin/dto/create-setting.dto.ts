import { IsNotEmpty, IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ConfigCategory } from './config-category.enum';

export class CreateSettingDto {
  @ApiProperty({
    description: 'Chave única da configuração',
    example: 'app.name',
  })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Valor da configuração',
    example: 'Readsy',
  })
  @IsNotEmpty()
  value: any;

  @ApiProperty({
    description: 'Descrição opcional da configuração',
    example: 'Nome da aplicação',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Categoria da configuração',
    enum: ConfigCategory,
    example: ConfigCategory.APP_SETTINGS,
    default: ConfigCategory.GENERAL,
  })
  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;
} 