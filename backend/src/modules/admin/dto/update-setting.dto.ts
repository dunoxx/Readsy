import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConfigCategory } from './config-category.enum';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'Chave da configuração',
    example: 'app.name',
    required: false,
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({
    description: 'Valor da configuração',
    example: 'Readsy',
    required: false,
  })
  @IsOptional()
  value?: any;

  @ApiProperty({
    description: 'Descrição da configuração',
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
    required: false,
  })
  @IsOptional()
  @IsEnum(ConfigCategory)
  category?: ConfigCategory;
} 