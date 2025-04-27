import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Nome do grupo',
    example: 'Clube de Leitura Fantástica'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'Grupo dedicado à leitura de obras fantásticas',
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
    description: 'Indica se o grupo é público',
    example: true
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    description: 'Indica se requer aprovação para entrar (obrigatório se isPublic = true)',
    example: false
  })
  @IsBoolean()
  requiresApproval: boolean;
} 