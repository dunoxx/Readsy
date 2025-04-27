import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MemberActionDto {
  @ApiProperty({
    description: 'ID do membro para realizar a ação',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  @IsUUID()
  memberId: string;
} 