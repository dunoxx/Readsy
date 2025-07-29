'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from './Navigation';
import { usePathname } from 'next/navigation';

export function ConditionalNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  
  console.log('🔍 ConditionalNavigation - Estado:', {
    isAuthenticated,
    isLoading,
    user,
    pathname
  });
  
  // Páginas onde não queremos mostrar a navegação
  const publicPages = ['/', '/auth/login', '/auth/register', '/auth/callback'];
  
  // Se está carregando, não mostra nada
  if (isLoading) {
    console.log('⏳ ConditionalNavigation - Carregando, não mostrando navegação');
    return null;
  }
  
  // Se está numa página pública, não mostra navegação
  if (publicPages.includes(pathname)) {
    console.log('🌐 ConditionalNavigation - Página pública, não mostrando navegação');
    return null;
  }
  
  // Se usuário não está logado, não mostra navegação
  if (!isAuthenticated || !user) {
    console.log('❌ ConditionalNavigation - Usuário não autenticado, não mostrando navegação');
    return null;
  }
  
  console.log('✅ ConditionalNavigation - Mostrando navegação');
  return <Navigation />;
} 