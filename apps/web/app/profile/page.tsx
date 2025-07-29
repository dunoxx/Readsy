'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkinApi } from '@/lib/checkinApi';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Trophy, 
  Coins,
  Users,
  Edit
} from 'lucide-react';
import { CheckinForm } from './CheckinForm';
import { CheckinTimeline } from './CheckinTimeline';
import { StatsBar } from './StatsBar';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [selectedBookId, setSelectedBookId] = useState('');
  const [refreshTimeline, setRefreshTimeline] = useState(false);
  const [userBooks, setUserBooks] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Buscar livros cadastrados do usuário
      fetch('/api/v1/books/search')
        .then(res => res.json())
        .then(data => setUserBooks(data));
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    { icon: BookOpen, label: 'Livros Lidos', value: '0', color: 'text-blue' },
    { icon: Trophy, label: 'XP Total', value: '0', color: 'text-yellow' },
    { icon: Coins, label: 'Moedas', value: '0', color: 'text-green' },
    { icon: Users, label: 'Seguidores', value: '0', color: 'text-primary' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header do Perfil */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-primary mb-1">{user.displayName}</h1>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde Janeiro 2024</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Brasil</span>
                </div>
              </div>
            </div>
            
            <button className="btn-outline">
              Editar Perfil
            </button>
          </div>
        </div>
        {/* Link para Estantes */}
        <div className="mb-8 flex justify-center">
          <a href="/shelves" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors shadow-sm">
            <BookOpen className="h-5 w-5 mr-2" /> Minhas Estantes
          </a>
        </div>

        {/* Estatísticas e Barra de Progresso */}
        <StatsBar />

        {/* Conteúdo do Perfil */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Atividade Recente + Check-in */}
          <div className="card">
            <h2 className="text-xl font-semibold text-primary mb-4">Atividade Recente</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecione um livro</label>
              <select
                className="input"
                value={selectedBookId}
                onChange={e => setSelectedBookId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {userBooks.map(book => (
                  <option key={book.id} value={book.id}>{book.title} - {book.author}</option>
                ))}
              </select>
            </div>
            <CheckinForm onCheckinSuccess={() => setRefreshTimeline(!refreshTimeline)} />
            {selectedBookId && (
              <CheckinTimeline key={refreshTimeline ? 'refresh' : 'no-refresh'} bookId={selectedBookId} />
            )}
          </div>
        </div>

        {/* Conquistas */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Conquistas</h2>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma conquista ainda</p>
            <p className="text-sm">Complete desafios para desbloquear conquistas!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 