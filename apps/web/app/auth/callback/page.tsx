'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Salvar tokens
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });

      // Buscar dados reais do usuário usando a API configurada
      api.get('/api/v1/users/me')
        .then(response => {
          console.log('✅ Dados do usuário carregados via Google:', response.data);
          setUser(response.data);
          toast.success('Login com Google realizado com sucesso!');
          router.push('/');
        })
        .catch(error => {
          console.error('❌ Erro ao buscar dados do usuário via Google:', error);
          toast.error('Erro ao buscar dados do usuário');
          router.push('/auth/login');
        });
    } else {
      toast.error('Erro no login com Google');
      router.push('/auth/login');
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Processando login...</p>
      </div>
    </div>
  );
} 