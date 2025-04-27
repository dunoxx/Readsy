import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({
    description: 'Nome do grupo',
    example: 'Clube de Leitura Fantasia',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'Grupo para discussão de livros de fantasia',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL da imagem do grupo',
    example: 'https://exemplo.com/imagem.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Se o grupo é público',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Se o grupo requer aprovação para novos membros',
    example: false,
    required: false
  })
  @ValidateIf(o => o.isPublic === true)
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;
} 