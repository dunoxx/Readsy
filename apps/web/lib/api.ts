import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          Cookies.set('accessToken', accessToken, { expires: 1 });
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token inválido, redirect para login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Não mostrar toast para erros específicos que são esperados
    const shouldShowToast = !(
      error.response?.status === 401 || 
      error.response?.status === 404 ||
      originalRequest.url?.includes('/users/me') || // Não mostrar erro para carregamento inicial do usuário
      originalRequest.url?.includes('/shelves') && error.response?.status === 404 // Não mostrar erro para estantes vazias
    );

    if (shouldShowToast) {
      const message = error.response?.data?.message || 'Erro inesperado';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Funções da API de autenticação
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => api.post('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post('/api/v1/auth/refresh', { refreshToken }),

  logout: () => api.post('/api/v1/auth/logout'),
};

// API de Estantes (Shelf)
export const shelfApi = {
  list: () => api.get('/api/v1/shelves'),
  create: (data: any) => api.post('/api/v1/shelves', data),
  update: (id: string, data: any) => api.patch(`/api/v1/shelves/${id}`, data),
  remove: (id: string) => api.delete(`/api/v1/shelves/${id}`),
  get: (id: string) => api.get(`/api/v1/shelves/${id}`),
  listPublicByUser: (userId: string) => api.get(`/api/v1/shelves/public/${userId}`),
  listBooks: (shelfId: string) => api.get(`/api/v1/shelves/${shelfId}/books`),
  addBook: (shelfId: string, data: any) => api.post(`/api/v1/shelves/${shelfId}/books`, data),
  updateBook: (shelfId: string, bookId: string, data: any) => api.patch(`/api/v1/shelves/${shelfId}/books/${bookId}`, data),
  deleteBook: (shelfId: string, bookId: string) => api.delete(`/api/v1/shelves/${shelfId}/books/${bookId}`),
  createBook: (data: any) => api.post('/api/v1/books', data),
  addBookToShelf: (shelfId: string, data: any) => api.post(`/api/v1/shelves/${shelfId}/books`, data),
};

// API de Livros Sugeridos
export const suggestedBookApi = {
  suggest: (data: any) => api.post('/api/v1/suggested-books', data),
  list: (status?: string) => api.get(`/api/v1/suggested-books${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get(`/api/v1/suggested-books/${id}`),
  approve: (id: string, notes?: string) => api.post(`/api/v1/suggested-books/${id}/approve`, { notes }),
  reject: (id: string, notes: string) => api.post(`/api/v1/suggested-books/${id}/reject`, { notes }),
};

// API de Favoritos
export const favoriteApi = {
  add: (bookId: string, data?: { rating?: number; read?: boolean }) => api.post(`/api/v1/favorites/${bookId}`, data),
  remove: (bookId: string) => api.delete(`/api/v1/favorites/${bookId}`),
  list: () => api.get('/api/v1/favorites'),
  check: (bookId: string) => api.get(`/api/v1/favorites/${bookId}/check`),
  update: (bookId: string, data: { rating?: number; read?: boolean }) => api.post(`/api/v1/favorites/${bookId}/update`, data),
};

// API de Wishlist
export const wishlistApi = {
  add: (bookId: string) => api.post(`/api/v1/wishlist/${bookId}`),
  remove: (bookId: string) => api.delete(`/api/v1/wishlist/${bookId}`),
  list: () => api.get('/api/v1/wishlist'),
  check: (bookId: string) => api.get(`/api/v1/wishlist/${bookId}/check`),
  generateSlug: () => api.get('/api/v1/wishlist/slug/generate'),
  getSlug: () => api.get('/api/v1/wishlist/slug'),
};

// API de Wishlist Pública (sem autenticação)
export const publicWishlistApi = {
  get: (slug: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    const url = `${apiUrl}/api/v1/public/wishlist/${slug}`;
    console.log('=== API CALL ===');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('URL base:', apiUrl);
    console.log('URL completa:', url);
    
    console.log('Iniciando fetch...');
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => {
      console.log('Fetch concluído!');
      console.log('Status da resposta:', res.status);
      console.log('URL da resposta:', res.url);
      console.log('Headers da resposta:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        return res.text().then(text => {
          console.log('Texto da resposta de erro:', text);
          throw new Error(`HTTP error! status: ${res.status}, body: ${text}`);
        });
      }
      
      return res.json().then(data => {
        console.log('JSON parseado:', data);
        return data;
      });
    }).catch(error => {
      console.error('Erro no fetch:', error);
      throw error;
    });
  },
}; 