export class SuggestedBookResponseDto {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  totalPages?: number;
  edition?: string;
  coverUrl?: string;
  status: string;
  suggestedById: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
} 