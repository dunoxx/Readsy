export class CheckinResponseDto {
  id: string;
  bookId: string;
  userId: string;
  pagesRead: number;
  currentPage: number;
  duration?: number;
  audioNoteUrl?: string;
  createdAt: Date;
  xpGained: number;
  coinsGained: number;
  totalXP: number;
  totalCoins: number;
  level: number;
} 