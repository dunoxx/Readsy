import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkinApi = {
  create: (data: any) => api.post('/api/v1/checkins', data),
  uploadAudio: (data: any) => api.post('/api/v1/checkins/audio', data),
  history: (bookId: string) => api.post(`/api/v1/checkins/history/${bookId}`),
  stats: () => api.post('/api/v1/checkins/stats'),
}; 