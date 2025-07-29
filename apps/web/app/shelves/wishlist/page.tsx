'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, ExternalLink, ShoppingCart, CheckCircle, Star, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { wishlistApi } from '@/lib/api';
import { FavoriteButton } from '@/components/FavoriteButton';
import { WishlistButton } from '@/components/WishlistButton';
import { HeaderWithMenu } from '../page';
import ShareModal from '@/components/ShareModal';

interface WishlistBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    coverUrl?: string;
    category?: string;
    totalPages: number;
  };
  amazonUrl?: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [books, setBooks] = useState<WishlistBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.list();
      console.log('Wishlist response:', response);
      setBooks(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar wishlist:', error);
      setError('Erro ao carregar lista de desejos');
      toast.error('Erro ao carregar lista de desejos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await wishlistApi.remove(bookId);
      setBooks(prev => prev.filter(book => book.book.id !== bookId));
      toast.success('Livro removido da lista de desejos');
    } catch (error) {
      console.error('Erro ao remover da wishlist:', error);
      toast.error('Erro ao remover da lista de desejos');
    }
  };

  const handleBuyNow = (amazonUrl: string, bookTitle: string) => {
    if (amazonUrl) {
      window.open(amazonUrl, '_blank');
      toast.success(`Abrindo ${bookTitle} na Amazon`);
    } else {
      toast.error('Link de compra não disponível para este livro');
    }
  };

  const handleShare = async () => {
    try {
      // Gerar slug se não existir
      const slugResponse = await wishlistApi.generateSlug();
      const slug = slugResponse.data.slug;
      
      const url = `${window.location.origin}/wishlist/${slug}`;
      setShareUrl(url);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Erro ao gerar link de compartilhamento:', error);
      toast.error('Erro ao gerar link de compartilhamento');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'w-5 h-5' : 'w-5 h-5';
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isHalfStar = rating >= i - 0.5 && rating < i;
      const isFullStar = rating >= i;
      
      stars.push(
        <div key={i} className="relative">
          <Star
            className={`${starSize} ${isFullStar ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
          />
          {isHalfStar && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
            </div>
          )}
        </div>
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <HeaderWithMenu active="shelves" />
      <div className="container-custom mx-auto px-2 py-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => router.push('/shelves')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Lista de Desejos <span className="font-normal text-blue-600 dark:text-blue-400">🧾</span>
            </h1>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-slate-500 dark:text-slate-400">Carregando lista de desejos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">
            <p className="text-lg mb-2">{error}</p>
            <button 
              onClick={fetchWishlist} 
              className="btn-primary"
            >
              Tentar Novamente
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg mb-4">Sua lista de desejos está vazia.</p>
            <p className="text-sm mb-6">Adicione livros à sua lista de desejos para vê-los aqui!</p>
            <button 
              onClick={() => router.push('/shelves')} 
              className="btn-primary"
            >
              Explorar Estantes
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-12">
            {books.map((item) => (
              <li key={item.id} className="relative group mb-10">
                <div className="flex flex-row rounded-2xl shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 h-full min-h-[220px] relative group transition-all">
                  {/* Capa do livro */}
                  <div className="flex flex-col items-center w-30 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 mr-6 p-2 relative">
                    {/* Botões de ação sobrepostos */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <FavoriteButton bookId={item.book.id} size="sm" />
                      <WishlistButton 
                        bookId={item.book.id} 
                        size="sm" 
                        initialIsInWishlist={true}
                        onToggle={(isInWishlist) => {
                          if (!isInWishlist) {
                            handleRemoveFromWishlist(item.book.id);
                          }
                        }}
                      />
                    </div>
                    {/* Container da imagem com altura fixa */}
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      {item.book.coverUrl ? (
                        <img 
                          src={item.book.coverUrl} 
                          alt={item.book.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Informações do livro */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.book.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-1">por <span className="font-semibold">{item.book.author}</span></p>
                      {item.book.category && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{item.book.category}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 mt-4">
                        {item.book.isbn && <span>ISBN: {item.book.isbn}</span>}
                        {item.book.totalPages && <span>{item.book.totalPages} páginas</span>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Botão de compra como continuidade do box */}
                {item.amazonUrl && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleBuyNow(item.amazonUrl || '', item.book.title)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/25"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Comprar Agora
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
        title="Minha Wishlist no Readsy"
        description="Confira minha lista de desejos no Readsy!"
      />
    </div>
  );
} 