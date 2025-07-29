import { Controller, Post, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserWishlistService } from './user-wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/wishlist')
@UseGuards(JwtAuthGuard)
export class UserWishlistController {
  constructor(private readonly userWishlistService: UserWishlistService) {}

  @Post(':bookId')
  async addToWishlist(@Param('bookId') bookId: string, @Req() req) {
    return this.userWishlistService.addToWishlist(req.user.userId, bookId);
  }

  @Delete(':bookId')
  async removeFromWishlist(@Param('bookId') bookId: string, @Req() req) {
    await this.userWishlistService.removeFromWishlist(req.user.userId, bookId);
    return { message: 'Livro removido da lista de desejos' };
  }

  @Get()
  async getWishlist(@Req() req) {
    return this.userWishlistService.getWishlist(req.user.userId);
  }

  @Get(':bookId/check')
  async isInWishlist(@Param('bookId') bookId: string, @Req() req) {
    const isInWishlist = await this.userWishlistService.isInWishlist(req.user.userId, bookId);
    return { isInWishlist };
  }

  @Get('slug/generate')
  async generateSlug(@Req() req) {
    const slug = await this.userWishlistService.generateWishlistSlug(req.user.userId);
    return { slug };
  }

  @Get('slug')
  async getSlug(@Req() req) {
    const slug = await this.userWishlistService.getWishlistSlug(req.user.userId);
    return { slug };
  }
} 