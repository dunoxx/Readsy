export class ShelfResponseDto {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  isWishlist: boolean;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  booksCount?: number;
  readingProgress?: number;
} 