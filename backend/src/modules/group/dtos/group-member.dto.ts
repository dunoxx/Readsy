import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class GroupMemberDto {
  @ApiProperty({
    description: 'ID único do membro no grupo',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  id: string;

  @ApiProperty({
    description: 'ID do grupo ao qual o membro pertence',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  groupId: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
  })
  userId: string;

  @ApiProperty({
    description: 'Função do usuário no grupo',
    enum: Role,
    example: 'MEMBER'
  })
  role: Role;

  @ApiProperty({
    description: 'Data de entrada no grupo',
    example: '2024-07-25T14:30:00Z'
  })
  joinedAt: Date;

  @ApiProperty({
    description: 'Data da última atividade no grupo',
    example: '2024-07-27T10:15:30Z'
  })
  lastActivityAt: Date;

  @ApiProperty({
    description: 'Pontos acumulados pelo membro no grupo',
    example: 1250
  })
  points: number;

  @ApiProperty({
    description: 'Número de desafios completados pelo membro no grupo',
    example: 15
  })
  completedChallenges: number;

  @ApiProperty({
    description: 'Informações básicas do usuário',
    type: 'object',
    example: {
      id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
      username: 'leitor123',
      displayName: 'Leitor Entusiasta',
      profilePicture: 'https://i.pravatar.cc/300'
    }
  })
  user?: {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string;
  };
} 