'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI, api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const loadUser = async () => {
    const token = Cookies.get('accessToken');
      console.log('🔍 AuthContext - Token encontrado:', !!token);
      
    if (token) {
        try {
          // Usar a API configurada com interceptors ao invés de fetch
          const response = await api.get('/api/v1/users/me');
          console.log('✅ AuthContext - Dados do usuário carregados:', response.data);
          setUser(response.data);
        } catch (error: any) {
          console.error('❌ AuthContext - Erro ao carregar dados do usuário:', error);
          // Se o token for inválido, limpar cookies
          if (error.response?.status === 401) {
            console.log('🔒 AuthContext - Token inválido, limpando cookies');
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
          }
          setUser(null);
        }
      } else {
        console.log('🔒 AuthContext - Nenhum token encontrado');
        setUser(null);
    }
      
    setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });

      setUser(userData);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      const { user: userData, accessToken, refreshToken } = response.data;

      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });

      setUser(userData);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext - Logout realizado');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  console.log('🔄 AuthContext - Renderizando com estado:', {
    user: !!user,
    isLoading,
    isAuthenticated
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 