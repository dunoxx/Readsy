'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { wishlistApi } from '@/lib/api';

interface WishlistButtonProps {
  bookId: string;
  initialIsInWishlist?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

export function WishlistButton({ 
  bookId, 
  initialIsInWishlist = false, 
  size = 'md',
  className = '',
  onToggle 
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar status inicial da wishlist
    const checkWishlistStatus = async () => {
      try {
        const response = await wishlistApi.check(bookId);
        setIsInWishlist(response.data.isInWishlist);
      } catch (error) {
        console.error('Erro ao verificar status da wishlist:', error);
      }
    };

    checkWishlistStatus();
  }, [bookId]);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isInWishlist) {
        await wishlistApi.remove(bookId);
        setIsInWishlist(false);
        toast.success('Removido da lista de desejos');
      } else {
        await wishlistApi.add(bookId);
        setIsInWishlist(true);
        toast.success('Adicionado à lista de desejos');
      }
      
      onToggle?.(!isInWishlist);
    } catch (error) {
      console.error('Erro ao alternar wishlist:', error);
      toast.error('Erro ao atualizar lista de desejos');
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
        ${isInWishlist 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-500 border border-slate-200 dark:border-slate-600'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isInWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
    >
      <Bookmark 
        className={`${iconSizes[size]} ${isInWishlist ? 'fill-current' : ''}`} 
        strokeWidth={isInWishlist ? 0 : 2}
      />
    </button>
  );
} 