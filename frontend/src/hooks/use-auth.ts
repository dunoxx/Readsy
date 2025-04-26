import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function useAuth({
  required = false,
  redirectTo = '/login',
  redirectIfFound = false,
  redirectAuthenticatedTo = '/dashboard',
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    loginWithGoogle,
    clearError,
  } = useAuthStore();
  
  const checkAuth = useCallback(() => {
    // Se estiver carregando, não faz nada
    if (isLoading) return;
    
    // Se a autenticação é obrigatória e o usuário não está autenticado
    if (required && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    
    // Se o usuário está autenticado mas não deveria estar nesta página
    if (redirectIfFound && isAuthenticated) {
      router.push(redirectAuthenticatedTo);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    pathname,
    redirectIfFound,
    redirectTo,
    required,
    redirectAuthenticatedTo,
    router,
  ]);
  
  // Verificar autenticação quando o componente montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    loginWithGoogle,
    clearError,
  };
} 