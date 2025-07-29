'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { favoriteApi } from '@/lib/api';

interface FavoriteButtonProps {
  bookId: string;
  initialIsFavorite?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ 
  bookId, 
  initialIsFavorite = false, 
  size = 'md',
  className = '',
  onToggle 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar status inicial do favorito
    const checkFavoriteStatus = async () => {
      try {
        const response = await favoriteApi.check(bookId);
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error('Erro ao verificar status do favorito:', error);
      }
    };

    checkFavoriteStatus();
  }, [bookId]);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteApi.remove(bookId);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await favoriteApi.add(bookId);
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos');
      }
      
      onToggle?.(!isFavorite);
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full transition-all duration-200
        hover:scale-110 active:scale-95
        ${isFavorite 
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
          : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-600'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart 
        className={`${iconSizes[size]} ${isFavorite ? 'fill-current' : ''}`} 
        strokeWidth={isFavorite ? 0 : 2}
      />
    </button>
  );
} 