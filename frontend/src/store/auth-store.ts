import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_URL } from '@/lib/config';

interface User {
  id: string;
  email: string;
  username?: string;
  displayName: string;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Métodos
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signup: async (email: string, password: string, displayName: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password,
            displayName,
          });
          
          const { accessToken, refreshToken } = response.data;
          
          // Buscar informações do usuário
          const userResponse = await axios.get(`${API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          set({
            accessToken,
            refreshToken,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Erro ao realizar cadastro',
            isLoading: false,
          });
          throw error;
        }
      },
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          });
          
          const { accessToken, refreshToken } = response.data;
          
          // Buscar informações do usuário
          const userResponse = await axios.get(`${API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          set({
            accessToken,
            refreshToken,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Email ou senha inválidos',
            isLoading: false,
          });
          throw error;
        }
      },
      
      loginWithGoogle: () => {
        window.location.href = `${API_URL}/auth/google`;
      },
      
      logout: async () => {
        try {
          const { accessToken } = get();
          
          if (accessToken) {
            await axios.post(
              `${API_URL}/auth/logout`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
            );
          }
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
          });
        }
      },
      
      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            return false;
          }
          
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            }
          );
          
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          
          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isAuthenticated: true,
          });
          
          return true;
        } catch (error) {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
          });
          return false;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'readsy-auth-storage', // nome para o localStorage
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 