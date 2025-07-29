export class CheckinHistoryDto {
  id: string;
  bookId: string;
  userId: string;
  pagesRead: number;
  currentPage: number;
  duration?: number;
  audioNoteUrl?: string;
  createdAt: Date;
} 