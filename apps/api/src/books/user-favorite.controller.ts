import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { UserFavoriteService } from './user-favorite.service';
import { CreateUserFavoriteDto, UpdateUserFavoriteDto } from './dto/user-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/favorites')
@UseGuards(JwtAuthGuard)
export class UserFavoriteController {
  constructor(private readonly userFavoriteService: UserFavoriteService) {}

  @Post(':bookId')
  async addToFavorites(
    @Param('bookId') bookId: string,
    @Req() req,
    @Body(ValidationPipe) dto?: CreateUserFavoriteDto
  ) {
    return this.userFavoriteService.addToFavorites(req.user.userId, bookId, dto);
  }

  @Delete(':bookId')
  async removeFromFavorites(@Param('bookId') bookId: string, @Req() req) {
    await this.userFavoriteService.removeFromFavorites(req.user.userId, bookId);
    return { message: 'Livro removido dos favoritos' };
  }

  @Get()
  async getFavorites(@Req() req) {
    return this.userFavoriteService.getFavorites(req.user.userId);
  }

  @Get(':bookId/check')
  async isFavorite(@Param('bookId') bookId: string, @Req() req) {
    const isFavorite = await this.userFavoriteService.isFavorite(req.user.userId, bookId);
    return { isFavorite };
  }

  @Post(':bookId/update')
  async updateFavorite(
    @Param('bookId') bookId: string,
    @Req() req,
    @Body(ValidationPipe) dto: UpdateUserFavoriteDto
  ) {
    return this.userFavoriteService.updateFavorite(req.user.userId, bookId, dto);
  }
} 