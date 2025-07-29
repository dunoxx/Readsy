import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { CheckinResponseDto } from './dto/checkin-response.dto';
import { UploadAudioDto } from './dto/upload-audio.dto';
import { CheckinHistoryDto } from './dto/checkin-history.dto';

@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos de registro, histórico, upload e gamificação serão implementados aqui

  async create(userId: string, dto: CreateCheckinDto): Promise<CheckinResponseDto> {
    // Limite: 1 check-in por livro por hora
    const lastCheckin = await this.prisma.checkin.findFirst({
      where: {
        userId,
        bookId: dto.bookId,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (lastCheckin) {
      throw new BadRequestException('Só é permitido 1 check-in por livro a cada hora.');
    }
    // Cálculo de XP e moedas (exemplo: 10 XP e 2 moedas por check-in)
    const xpGained = 10;
    const coinsGained = 2;
    // Cria o check-in
    const checkin = await this.prisma.checkin.create({
      data: {
        userId,
        bookId: dto.bookId,
        pagesRead: dto.pagesRead,
        currentPage: dto.currentPage,
        duration: dto.duration,
        audioNoteUrl: dto.audioNoteUrl,
      },
    });
    // Atualiza stats do usuário
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: { increment: xpGained },
        coins: { increment: coinsGained },
      },
    });
    // Cálculo de nível (exemplo: 100 XP por nível)
    const level = Math.floor(user.totalXP / 100) + 1;
    return {
      id: checkin.id,
      bookId: checkin.bookId,
      userId: checkin.userId,
      pagesRead: checkin.pagesRead,
      currentPage: checkin.currentPage,
      duration: checkin.duration,
      audioNoteUrl: checkin.audioNoteUrl,
      createdAt: checkin.createdAt,
      xpGained,
      coinsGained,
      totalXP: user.totalXP,
      totalCoins: user.coins,
      level,
    };
  }

  // Mock de upload de áudio: apenas salva a URL recebida (em produção, integrar com storage)
  async uploadAudio(userId: string, dto: UploadAudioDto) {
    // Aqui seria feita a validação do arquivo, duração, etc.
    // Exemplo: aceitar apenas .mp3 e até 60s (validação real depende do storage/backend de arquivos)
    if (!dto.fileUrl.endsWith('.mp3')) {
      throw new BadRequestException('Apenas arquivos .mp3 são permitidos');
    }
    // Retorna a URL salva
    return { audioNoteUrl: dto.fileUrl };
  }

  async history(userId: string, bookId: string): Promise<CheckinHistoryDto[]> {
    const checkins = await this.prisma.checkin.findMany({
      where: { userId, bookId },
      orderBy: { createdAt: 'desc' },
    });
    return checkins.map(c => ({
      id: c.id,
      bookId: c.bookId,
      userId: c.userId,
      pagesRead: c.pagesRead,
      currentPage: c.currentPage,
      duration: c.duration ?? undefined,
      audioNoteUrl: c.audioNoteUrl ?? undefined,
      createdAt: c.createdAt,
    }));
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const level = Math.floor(user.totalXP / 100) + 1;
    const xpForNextLevel = 100;
    const currentLevelXP = user.totalXP % 100;
    return {
      totalXP: user.totalXP,
      coins: user.coins,
      level,
      currentLevelXP,
      xpForNextLevel,
      progress: currentLevelXP / xpForNextLevel,
    };
  }
} 