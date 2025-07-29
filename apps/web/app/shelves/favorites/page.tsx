'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Edit2, CheckCircle, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { favoriteApi } from '@/lib/api';
import { FavoriteButton } from '@/components/FavoriteButton';
import { WishlistButton } from '@/components/WishlistButton';
import { BookModal } from '@/components/BookModal';
import { HeaderWithMenu } from '../page';

interface FavoriteBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    isbn10?: string;
    coverUrl?: string;
    category?: string;
    totalPages: number;
  };
  rating?: number;
  read: boolean;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [books, setBooks] = useState<FavoriteBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<FavoriteBook | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteApi.list();
      console.log('Favorites response:', response);
      setBooks(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar favoritos:', error);
      setError('Erro ao carregar favoritos');
      toast.error('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (bookId: string) => {
    try {
      await favoriteApi.remove(bookId);
      setBooks(prev => prev.filter(book => book.book.id !== bookId));
      toast.success('Livro removido dos favoritos');
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      toast.error('Erro ao remover dos favoritos');
    }
  };

  const handleUpdateFavorite = async (bookData: any) => {
    try {
      const response = await favoriteApi.update(bookData.id, {
        rating: bookData.rating,
        read: bookData.read,
      });
      
      setBooks(prev => prev.map(book => 
        book.book.id === bookData.id 
          ? { ...book, rating: bookData.rating, read: bookData.read }
          : book
      ));
      
      setEditingBook(null);
      toast.success('Favorito atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar favorito:', error);
      toast.error('Erro ao atualizar favorito');
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
      <div className="container-custom mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/shelves')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-6 h-6 text-slate-500 dark:text-slate-300" />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Meus Favoritos <span className="font-normal text-red-600 dark:text-red-400">❤️</span>
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-slate-500 dark:text-slate-400">Carregando favoritos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">
            <p className="text-lg mb-2">{error}</p>
            <button 
              onClick={fetchFavorites} 
              className="btn-primary"
            >
              Tentar Novamente
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg mb-4">Você ainda não tem favoritos.</p>
            <p className="text-sm mb-6">Adicione livros aos seus favoritos para vê-los aqui!</p>
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
              <li key={item.id} className="relative group">
                <div className="flex flex-row rounded-2xl shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 h-full min-h-[220px] relative group transition-all">
                  {/* Capa do livro */}
                  <div className="flex flex-col items-center w-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 mr-6 p-2 relative">
                    {/* Botões de ação sobrepostos */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <FavoriteButton 
                        bookId={item.book.id} 
                        size="sm" 
                        initialIsFavorite={true}
                        onToggle={(isFavorite) => {
                          if (!isFavorite) {
                            handleRemoveFromFavorites(item.book.id);
                          }
                        }}
                      />
                      <WishlistButton bookId={item.book.id} size="sm" />
                    </div>
                    {/* Container da imagem com altura fixa */}
                    <div className="w-full h-36 rounded-lg overflow-hidden">
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
                    {/* Estrelas abaixo da imagem */}
                    <div className="flex items-center gap-1 mt-2">
                      {renderStars(item.rating || 0, 'sm')}
                    </div>
                  </div>

                  {/* Informações do livro */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.book.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-1">por <span className="font-semibold">{item.book.author}</span></p>

                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-5 h-5 ${item.read ? 'text-green-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${item.read ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.read ? 'Lido' : 'Não lido'}
                        </span>
                      </div>
                      

                      
                      <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 mt-4">
                        <span>ISBN: {item.book.isbn || 'N/A'}</span>
                        {item.book.totalPages && <span>{item.book.totalPages} páginas</span>}
                      </div>

                      <div className="flex justify-end">
                        <button
                          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          onClick={() => setEditingBook(item)}
                          title="Editar favorito"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modal de edição */}
        {editingBook && (
          <BookModal
            open={true}
            onClose={() => setEditingBook(null)}
            onSave={handleUpdateFavorite}
            initialData={{
              id: editingBook.book.id,
              name: editingBook.book.title,
              author: editingBook.book.author,
              isbn: editingBook.book.isbn,
              coverUrl: editingBook.book.coverUrl,
              publisher: editingBook.book.category || '',
              pages: editingBook.book.totalPages,
              edition: '',
              rating: editingBook.rating || 0,
              read: editingBook.read,
            }}
          />
        )}
      </div>
    </div>
  );
} 