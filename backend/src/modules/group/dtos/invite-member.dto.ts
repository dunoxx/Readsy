import { IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty({
    description: 'ID do usuário a ser convidado',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    required: false
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
  
  @ApiProperty({
    description: 'Email do usuário a ser convidado',
    example: 'usuario@exemplo.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;
} 