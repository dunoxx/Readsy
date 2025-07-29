import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PublicWishlistService } from './public-wishlist.service';

@Controller('api/v1/public/wishlist')
export class PublicWishlistController {
  constructor(private readonly publicWishlistService: PublicWishlistService) {}

  @Get(':slug')
  async getPublicWishlist(@Param('slug') slug: string) {
    console.log('=== CONTROLLER PÚBLICO ===');
    console.log('Buscando wishlist pública com slug:', slug);
    
    try {
      const wishlist = await this.publicWishlistService.getPublicWishlist(slug);
      
      console.log('Resultado da busca:', wishlist ? 'encontrada' : 'não encontrada');
      console.log('Dados retornados:', wishlist);
      
      if (!wishlist) {
        console.log('Wishlist não encontrada, lançando NotFoundException');
        throw new NotFoundException('Wishlist não encontrada');
      }

      console.log('Retornando wishlist com sucesso');
      return wishlist;
    } catch (error) {
      console.log('Erro no controller público:', error);
      throw error;
    }
  }
} 