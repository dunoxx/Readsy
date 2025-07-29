import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { SuggestedBookService } from './suggested-book.service';
import { SuggestedBookController } from './suggested-book.controller';
import { UserFavoriteService } from './user-favorite.service';
import { UserFavoriteController } from './user-favorite.controller';
import { UserWishlistService } from './user-wishlist.service';
import { UserWishlistController } from './user-wishlist.controller';
import { PublicWishlistService } from './public-wishlist.service';
import { PublicWishlistController } from './public-wishlist.controller';

@Module({
  controllers: [
    BookController, 
    SuggestedBookController, 
    UserFavoriteController, 
    UserWishlistController,
    PublicWishlistController
  ],
  providers: [
    BookService, 
    SuggestedBookService, 
    UserFavoriteService, 
    UserWishlistService,
    PublicWishlistService
  ],
  exports: [
    BookService, 
    SuggestedBookService, 
    UserFavoriteService, 
    UserWishlistService
  ],
})
export class BookModule {} 