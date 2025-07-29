export class UserWishlistResponseDto {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string;

    coverUrl?: string;
    category?: string;
    totalPages: number;
  };
  amazonUrl?: string; // URL de afiliado da Amazon
} 