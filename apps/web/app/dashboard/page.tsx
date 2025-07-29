'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Image, 
  Send, 
  Heart, 
  MessageCircle, 
  Share2, 
  BookOpen,
  Users,
  Trophy,
  Sparkles,
  CheckCircle,
  Home
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [postContent, setPostContent] = useState('');

  // Não usar coverUrl, apenas avatar

  // Mock estatísticas
  const stats = [
    {
      label: 'Lendo',
      value: 3,
      icon: <BookOpen className="h-7 w-7 text-readsy-blue mb-1" />,
      color: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Lidos',
      value: 12,
      icon: <CheckCircle className="h-7 w-7 text-readsy-green mb-1" />,
      color: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'Grupos',
      value: 5,
      icon: <Users className="h-7 w-7 text-readsy-yellow mb-1" />,
      color: 'bg-yellow-50 dark:bg-yellow-900/30',
    },
    {
      label: 'Desafios Concluídos',
      value: 7,
      icon: <Trophy className="h-7 w-7 text-readsy-red mb-1" />,
      color: 'bg-red-50 dark:bg-red-900/30',
    },
  ];

  // Mock infos header
  const userStats = [
    { label: 'Postagens', value: 24, icon: <MessageCircle className="h-5 w-5 text-readsy-blue" /> },
    { label: 'Seguidores', value: 45, icon: <Users className="h-5 w-5 text-readsy-green" /> },
    { label: 'Seguindo', value: 32, icon: <Users className="h-5 w-5 text-readsy-yellow" /> },
  ];

  // Mock menu módulos
  const modules = [
    { label: 'Feed', href: '/dashboard', icon: <Home className="h-5 w-5" />, active: true },
    { label: 'Estantes', href: '/shelves', icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Grupos', href: '/groups', icon: <Users className="h-5 w-5" /> },
    { label: 'Desafios', href: '/challenges', icon: <Trophy className="h-5 w-5" /> },
  ];

  const handleCreatePost = () => {
    if (postContent.trim()) {
      // TODO: Implementar criação de post
      console.log('Novo post:', postContent);
      setPostContent('');
    }
  };

  // Mock data para o feed
  const feedPosts = [
    {
      id: 1,
      author: {
        name: 'Ana Silva',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2b5?w=150&h=150&fit=crop&crop=face',
        username: '@ana_leitora'
      },
      content: 'Acabei de terminar "O Nome do Vento" e estou completamente apaixonada! A escrita do Patrick Rothfuss é simplesmente mágica. Alguém mais já leu? 📚✨',
      book: {
        title: 'O Nome do Vento',
        author: 'Patrick Rothfuss',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=150&fit=crop'
      },
      timestamp: '2 horas atrás',
      likes: 12,
      comments: 5,
      shares: 2
    },
    {
      id: 2,
      author: {
        name: 'Carlos Santos',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        username: '@carlos_books'
      },
      content: 'Meta de leitura de janeiro: ✅ CONCLUÍDA! Li 4 livros este mês. Próximo desafio: ler um clássico que nunca tive coragem de encarar. Sugestões? 🤔',
      timestamp: '4 horas atrás',
      likes: 8,
      comments: 12,
      shares: 1
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header estilo Facebook Page - imagem de capa */}
      {/* Se quiser adicionar uma imagem de capa, adicione o campo coverUrl no modelo User e ajuste aqui. */}
      <div className="relative w-full h-[320px] bg-gradient-blue-purple flex items-end overflow-hidden shadow-lg mb-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" style={{ zIndex: 2 }} />
        <button className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-slate-700 px-4 py-2 rounded-lg shadow flex items-center gap-2 font-medium text-sm">
          <Image className="h-5 w-5 text-readsy-blue" />
          Editar capa
        </button>
      </div>
      {/* Bloco flat abaixo do header, alinhado ao container */}
      <div className="container-custom relative flex flex-col md:flex-row items-end justify-between gap-6 py-0 px-0" style={{ minHeight: 120 }}>
        {/* Avatar: metade sobre o header, metade sobre o fundo flat */}
        <div className="absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 top-[-80px] md:top-[-80px] w-48 h-48 rounded-full border-4 border-white dark:border-slate-900 shadow-lg bg-gradient-blue-purple flex items-center justify-center overflow-hidden z-20">
          {typeof user?.avatar === 'string' && user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl font-bold text-white">
              {user?.displayName?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        {/* Espaço para alinhar nome e username à direita do avatar, ambos fora do header */}
        <div className="flex-1 flex flex-col items-start md:ml-48 mt-8 md:mt-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
            {user?.displayName || ''}
          </h1>
          <span className="text-lg text-slate-500 dark:text-slate-300 mb-2">@{user?.username || ''}</span>
        </div>
        {/* Cards de stats à direita, fora do header */}
        <div className="flex gap-6 md:gap-4 mt-8 md:mt-3">
          {userStats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center bg-white dark:bg-slate-800 rounded-xl shadow px-6 py-3 border border-slate-100 dark:border-slate-700 min-w-[110px]">
              <div className="mb-1">{stat.icon}</div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{stat.value}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Linha divisória e menu de módulos */}
      <div className="w-full border-b border-slate-200 dark:border-slate-700 mt-3" />
      <nav className="w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-40">
        <div className="container-custom flex gap-4 py-3">
          {modules.map((mod, idx) => (
            <a
              key={mod.href}
              href={mod.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${mod.active ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow' : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
            >
              {mod.icon}
              <span>{mod.label}</span>
            </a>
          ))}
        </div>
      </nav>
      <div className="w-full border-b border-slate-200 dark:border-slate-700 mt-0" />
      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Feed Principal (60%) */}
          <div className="lg:col-span-7">
            {/* Criar Post */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gradient-blue-purple rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-white">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={t('dashboard.create.post')}
                    className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:ring-2 focus:ring-readsy-blue focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200">
                        <Image className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200">
                        <BookOpen className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!postContent.trim()}
                      className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t('dashboard.publish')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed de Posts */}
            <div className="space-y-6">
              {feedPosts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                  {/* Header do Post */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{post.author.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{post.author.username} • {post.timestamp}</p>
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <p className="text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">{post.content}</p>

                  {/* Livro (se houver) */}
                  {post.book && (
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl mb-4">
                      <img
                        src={post.book.cover}
                        alt={post.book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{post.book.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{post.book.author}</p>
                      </div>
                    </div>
                  )}

                  {/* Ações do Post */}
                  <div className="flex items-center space-x-6 pt-4 border-t border-slate-100 dark:border-slate-600">
                    <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-readsy-red transition-colors duration-200">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-readsy-blue transition-colors duration-200">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-readsy-green transition-colors duration-200">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">{post.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Direita (40%) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 1. Livros em alta - agora é o primeiro box */}
            <div className="bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50 dark:from-blue-900/30 dark:via-yellow-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6 flex flex-col gap-4 relative overflow-hidden">
              <h4 className="font-extrabold text-2xl text-readsy-blue mb-2 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-readsy-blue" /> Livros em Alta
              </h4>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 shadow border border-blue-100 dark:border-blue-900">
                    <div className="w-14 h-20 bg-gradient-to-b from-blue-200 to-blue-400 dark:from-blue-900 dark:to-blue-700 rounded shadow-lg flex items-center justify-center font-bold text-white text-lg">{item}</div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-slate-800 dark:text-slate-100">Livro Popular {item}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Autor {item}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-bold shadow">Destaque</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Resumo do Perfil */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-readsy-blue" /> Resumo do Perfil
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className={`flex flex-col items-center p-4 rounded-xl ${stat.color}`}>
                    {stat.icon}
                    <span className="text-xl font-bold">{stat.value}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Ações rápidas */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-readsy-green" /> Ações Rápidas
              </h4>
              <div className="flex flex-col gap-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 text-left bg-blue-50 dark:bg-blue-900/30">
                  <BookOpen className="h-5 w-5 text-readsy-blue" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Adicionar Livro</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 text-left bg-green-50 dark:bg-green-900/30">
                  <Users className="h-5 w-5 text-readsy-green" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Encontrar Amigos</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 text-left bg-yellow-50 dark:bg-yellow-900/30">
                  <Trophy className="h-5 w-5 text-readsy-yellow" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Ver Conquistas</span>
                </button>
              </div>
            </div>

            {/* 4. Desafios globais */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-readsy-yellow" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Desafios Globais</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Nível 5</span>
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full font-bold text-yellow-700 dark:text-yellow-300">XP 1.200</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <Sparkles className="h-5 w-5 text-readsy-blue" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Desafio do Dia</div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Ler 20 páginas hoje</div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800/40 rounded-full text-xs font-bold text-blue-700 dark:text-blue-200">Pendente</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/30">
                  <Trophy className="h-5 w-5 text-readsy-green" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Desafio da Semana</div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Finalizar 1 livro</div>
                  </div>
                  <span className="px-2 py-0.5 bg-green-200 dark:bg-green-800/40 rounded-full text-xs font-bold text-green-700 dark:text-green-200">Em Progresso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 