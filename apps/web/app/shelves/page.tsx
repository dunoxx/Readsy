'use client';

import { useEffect, useState } from 'react';
import { shelfApi, wishlistApi, favoriteApi } from '@/lib/api';
import { Home, BookOpen, Users, Trophy, Lock, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ShelfModal } from '@/components/ShelfModal';
import { PremiumModal } from '@/components/PremiumModal';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { CountUp } from './CountUp';
import { Gauge } from './Gauge';

export function HeaderWithMenu({ active }: { active: string }) {
  const { user } = useAuth();
  
  console.log('🔍 HeaderWithMenu - user:', user);
  
  const coverUrl = '/images/dashboard-cover-default.jpg';
  const userStats = [
    { label: 'Postagens', value: 24, icon: <BookOpen className="h-5 w-5 text-readsy-blue" /> },
    { label: 'Seguidores', value: 45, icon: <Users className="h-5 w-5 text-readsy-green" /> },
    { label: 'Seguindo', value: 32, icon: <Users className="h-5 w-5 text-readsy-yellow" /> },
  ];
  const modules = [
    { label: 'Feed', href: '/dashboard', icon: <Home className="h-5 w-5" />, active: active === 'feed' },
    { label: 'Estantes', href: '#shelves-content', icon: <BookOpen className="h-5 w-5" />, active: active === 'shelves' },
    { label: 'Grupos', href: '/groups', icon: <Users className="h-5 w-5" />, active: active === 'groups' },
    { label: 'Desafios', href: '/challenges', icon: <Trophy className="h-5 w-5" />, active: active === 'challenges' },
  ];
  
  return (
    <>
      <div className="relative w-full h-[320px] bg-gradient-blue-purple flex items-end overflow-hidden shadow-lg mb-0">
        <img
          src={coverUrl}
          alt="Capa do usuário"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" style={{ zIndex: 2 }} />
      </div>
      <div className="container-custom relative flex flex-col md:flex-row items-end justify-between gap-6 py-0 px-0" style={{ minHeight: 120 }}>
        <div className="absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 top-[-80px] md:top-[-80px] w-48 h-48 rounded-full border-4 border-white dark:border-slate-900 shadow-lg bg-gradient-blue-purple flex items-center justify-center overflow-hidden z-20">
            <span className="text-5xl font-bold text-white">
              {user?.displayName?.charAt(0) || 'U'}
            </span>
        </div>
        <div className="flex-1 flex flex-col items-start md:ml-48 mt-8 md:mt-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
            {user?.displayName || 'Usuário'}
          </h1>
          <span className="text-lg text-slate-500 dark:text-slate-300 mb-2">@{user?.username || 'usuario'}</span>
        </div>
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
    </>
  );
}

function getShelfTextColor(bg: string | undefined) {
  switch (bg) {
    case 'bg-blue-200': return 'text-blue-700';
    case 'bg-green-200': return 'text-green-700';
    case 'bg-yellow-200': return 'text-yellow-700';
    case 'bg-purple-200': return 'text-purple-700';
    case 'bg-pink-200': return 'text-pink-700';
    case 'bg-orange-200': return 'text-orange-700';
    case 'bg-gray-200': return 'text-slate-700';
    case 'bg-red-200': return 'text-red-700';
    default: return 'text-slate-700';
  }
}

export default function ShelvesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log('🔍 ShelvesPage - user:', user, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  const [realShelves, setRealShelves] = useState<any[]>([]);
  const [shelvesLoading, setShelvesLoading] = useState(true);
  const [drawerShelf, setDrawerShelf] = useState<any>(undefined);
  const [premiumModal, setPremiumModal] = useState<{ open: boolean; shelfName?: string }>({ open: false });
  const [wishlistData, setWishlistData] = useState({ booksCount: 0 });
  const [favoritesData, setFavoritesData] = useState({ booksCount: 0, readingProgress: 0 });

  // Estantes fixas
  const wishlistShelf = {
    id: 'wishlist',
    name: 'Wishlist',
    emoji: '🧾',
    color: 'bg-blue-200',
    isWishlist: true,
    isPublic: true,
    booksCount: wishlistData.booksCount,
    readingProgress: 0,
  };

  const favoritesShelf = {
    id: 'favorites',
    name: 'Favoritos',
    emoji: '❤️',
    color: 'bg-red-200',
    isFavorites: true,
    isPublic: true,
    booksCount: favoritesData.booksCount,
    readingProgress: favoritesData.readingProgress,
  };

  const getShelvesWithFixed = () => {
    // Sempre incluir as estantes fixas no início
    return [wishlistShelf, favoritesShelf, ...realShelves];
  };

  const shelvesWithoutWishlist = getShelvesWithFixed().filter(s => !s.isWishlist);
  const customShelves = realShelves.filter(s => !s.isWishlist && !s.isFavorites);
  const isPremium = user?.isPremium;
  const canCreateShelf = isPremium || customShelves.length < 1;

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, pulando busca de estantes');
      return;
    }
    
    setShelvesLoading(true);
    console.log('📥 Buscando estantes via API...');
    
    // Buscar estantes normais
    const fetchShelves = shelfApi.list()
      .then(res => {
        const data = res.data;
        console.log('📚 Estantes recebidas:', data);
        setRealShelves(data);
      })
      .catch(error => {
        console.error('❌ Erro ao buscar estantes:', error);
        toast.error('Erro ao carregar estantes');
      });

    // Buscar dados da wishlist
    const fetchWishlist = wishlistApi.list()
      .then(res => {
        const books = res.data || [];
        console.log('🧾 Wishlist recebida:', books);
        setWishlistData({ booksCount: books.length });
      })
      .catch(error => {
        console.error('❌ Erro ao buscar wishlist:', error);
      });

    // Buscar dados dos favoritos
    const fetchFavorites = favoriteApi.list()
      .then(res => {
        const books = res.data || [];
        console.log('❤️ Favoritos recebidos:', books);
        const readBooks = books.filter((book: any) => book.read).length;
        const readingProgress = books.length > 0 ? Math.round((readBooks / books.length) * 100) : 0;
        setFavoritesData({ 
          booksCount: books.length, 
          readingProgress 
        });
      })
      .catch(error => {
        console.error('❌ Erro ao buscar favoritos:', error);
      });

    // Aguardar todas as requisições
    Promise.all([fetchShelves, fetchWishlist, fetchFavorites])
      .finally(() => setShelvesLoading(false));

    // Listener para atualização vinda de outras páginas
    const onRefresh = () => {
      console.log('🔄 Atualizando lista de estantes...');
      
      // Atualizar estantes normais
      const updateShelves = shelfApi.list()
        .then(res => {
          console.log('✅ Estantes atualizadas:', res.data);
          setRealShelves(res.data);
        })
        .catch((error) => {
          console.error('❌ Erro ao atualizar estantes:', error);
        });

      // Atualizar wishlist
      const updateWishlist = wishlistApi.list()
        .then(res => {
          const books = res.data || [];
          setWishlistData({ booksCount: books.length });
        })
        .catch((error) => {
          console.error('❌ Erro ao atualizar wishlist:', error);
        });

      // Atualizar favoritos
      const updateFavorites = favoriteApi.list()
        .then(res => {
          const books = res.data || [];
          const readBooks = books.filter((book: any) => book.read).length;
          const readingProgress = books.length > 0 ? Math.round((readBooks / books.length) * 100) : 0;
          setFavoritesData({ 
            booksCount: books.length, 
            readingProgress 
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao atualizar favoritos:', error);
        });

      Promise.all([updateShelves, updateWishlist, updateFavorites]);
    };
    
    // Verificar se há atualizações pendentes
    const refreshKey = window.localStorage.getItem('refreshShelves');
    if (refreshKey) {
      window.localStorage.removeItem('refreshShelves');
      onRefresh();
    }
    
    window.addEventListener('storage', onRefresh);
    return () => window.removeEventListener('storage', onRefresh);
  }, [isAuthenticated]);

  const handleSaveShelf = async (shelf: any) => {
    console.log('🚀 Iniciando salvamento da estante:', shelf);
    try {
      let saved: any;
      if (shelf.id && realShelves.some(b => b.id === shelf.id)) {
        console.log('📝 Editando estante existente:', shelf.id);
        const response = await shelfApi.update(shelf.id, shelf);
        saved = response.data;
        setRealShelves(prev => prev.map(b => b.id === shelf.id ? saved : b));
        console.log('✅ Estante editada com sucesso:', saved);
      } else {
        console.log('🆕 Criando nova estante');
        const response = await shelfApi.create(shelf);
        saved = response.data;
        setRealShelves(prev => [...prev, saved]);
        console.log('✅ Nova estante criada com sucesso:', saved);
      }
      setDrawerShelf(undefined);
      toast.success('Estante salva com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro completo ao salvar estante:', err);
      console.error('📄 Response data:', err?.response?.data);
      console.error('📊 Response status:', err?.response?.status);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar estante';
      toast.error(errorMessage);
    }
  };

  const handleRemoveShelf = async (id: string) => {
    try {
      await shelfApi.remove(id);
      setRealShelves(prev => prev.filter(shelf => shelf.id !== id));
      setDrawerShelf(undefined);
    } catch (err: any) {
      console.error('Erro ao remover estante:', err);
      toast.error(err?.response?.data?.message || 'Erro ao remover estante');
    }
  };

  const checkShelfAccess = (shelf: any) => {
    // Estantes fixas sempre acessíveis
    if (shelf.isWishlist || shelf.isFavorites) {
      return true;
    }
    
    // Usuários premium têm acesso a todas as estantes
    if (isPremium) {
      return true;
    }
    
    // Usuários free só podem acessar a primeira estante personalizada
    const customShelves = realShelves.filter(s => !s.isWishlist && !s.isFavorites);
    const isFirstShelf = customShelves.length > 0 && customShelves[0].id === shelf.id;
    
    if (!isFirstShelf) {
      setPremiumModal({ open: true, shelfName: shelf.name });
      return false;
    }
    
    return true;
  };

  const handleShelfClick = (shelf: any, e: React.MouseEvent) => {
    // Estantes fixas sempre acessíveis
    if (shelf.isWishlist || shelf.isFavorites) {
      return true;
    }
    
    if (!checkShelfAccess(shelf)) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  const handleUpgradeClick = () => {
    // TODO: Implementar redirecionamento para página de upgrade
    toast.success('Redirecionando para página de upgrade...');
    setPremiumModal({ open: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const shelves = getShelvesWithFixed();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <HeaderWithMenu active="shelves" />
      <div className="container-custom py-8 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Minhas Estantes
          </h1>
          <button
            onClick={() => {
              if (!canCreateShelf) {
                setPremiumModal({ open: true });
              } else {
                setDrawerShelf(null);
              }
            }}
            className="btn-primary"
          >
            Nova Estante
          </button>
        </div>

        <div id="shelves-content">
              {shelvesLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando estantes...</p>
            </div>
          ) : (
            <>
              {shelves.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Você ainda não tem estantes.</p>
                  <button className="btn-primary mt-2" onClick={() => {
                    if (!canCreateShelf) {
                      setPremiumModal({ open: true });
                    } else {
                      setDrawerShelf(null);
                    }
                  }}>
                    Criar Primeira Estante
                  </button>
                </div>
              )}
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-2 mt-2">
                {shelves.map((shelf) => (
                  <li key={shelf.id} className="h-full py-4 mt-4">
                    <Link
                      href={shelf.isWishlist ? '/shelves/wishlist' : 
                            shelf.isFavorites ? '/shelves/favorites' : 
                            `/shelves/${shelf.id}`}
                      className="block h-full"
                      tabIndex={0}
                      aria-label={`Acessar estante ${shelf.name}`}
                      onClick={(e) => handleShelfClick(shelf, e)}
                    >
                      <div
                        className="relative flex flex-col justify-between rounded-xl shadow-md bg-white dark:bg-slate-800 transition hover:shadow-lg group border border-slate-100 dark:border-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-400 outline-none"
                        style={{ minHeight: 220 }}
                      >
                        <div className={`relative flex flex-col items-center justify-center ${shelf.color || 'bg-blue-200'} pb-2 pt-10 rounded-t-xl ${!checkShelfAccess(shelf) ? 'opacity-60' : ''}`} style={{ height: 120 }}>
                          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-40px' }}>
                            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900">
                              <span className="text-5xl select-none">
                                {shelf.emoji}
                              </span>
                            </div>
                          </div>
                          <div className="h-10" />
                          <span className={`font-semibold text-base md:text-lg ${getShelfTextColor(shelf.color)} mb-1 text-center drop-shadow-sm`} style={{textShadow: '0 1px 2px rgba(0,0,0,0.08)'}}>{shelf.name}</span>
                          <div className="flex gap-2 justify-center mt-1 mb-1">
                            {shelf.isWishlist && <span className="text-xs bg-white/80 dark:bg-slate-900/80 text-blue-600 dark:text-blue-300 rounded px-2 py-0.5">Wishlist</span>}
                            {shelf.isFavorites && <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded px-2 py-0.5">Favoritos</span>}
                            {shelf.isPublic && <span className="text-xs bg-green-100 dark:bg-green-900/80 text-green-600 dark:text-green-300 rounded px-2 py-0.5">Pública</span>}
                            {!shelf.isPublic && !shelf.isWishlist && (
                              <span className="text-xs bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-300 rounded px-2 py-0.5">Privada</span>
                            )}
                            {!checkShelfAccess(shelf) && (
                              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded px-2 py-0.5 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row gap-3 w-full mt-4 px-4 pb-3">
                          <div className={`flex ${shelf.isWishlist ? 'flex-1' : 'flex-1'} bg-slate-50 dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 min-h-[64px] py-4`}>
                            <div className="flex flex-col justify-center items-center w-full h-20">
                              <div className="flex items-center gap-1">
                                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-300 leading-none">
                                  <CountUp end={shelf.booksCount ?? 0} />
                                </span>
                                <BookOpen className="w-7 h-7 text-blue-400 dark:text-blue-300 ml-1" />
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-300 mt-1">Livros</span>
                            </div>
                          </div>
                          {!shelf.isWishlist && (
                            <div className="flex flex-1 bg-slate-50 dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 min-h-[64px] py-4">
                              <div className="flex flex-col justify-center items-center w-full h-20">
                                <Gauge value={shelf.readingProgress ?? 0} size={60} />
                                <span className="text-xs text-slate-500 dark:text-slate-300 mt-1">% lidos</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {!shelf.isWishlist && !shelf.isFavorites && (
                          <div className="absolute top-2 right-2 z-20" onClick={e => e.preventDefault()}>
                            <button
                              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              onClick={() => setDrawerShelf(shelf)}
                              title="Opções"
                              tabIndex={-1}
                            >
                              <Edit2 className={`w-5 h-5 ${getShelfTextColor(shelf.color)} `} />
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <ShelfModal
          open={drawerShelf !== undefined}
          onClose={() => setDrawerShelf(undefined)}
          onSave={async (data) => {
            await handleSaveShelf(data);
            setDrawerShelf(undefined);
          }}
          onDelete={async (id: string) => {
            await handleRemoveShelf(id);
            setDrawerShelf(undefined);
          }}
          initialData={drawerShelf}
            />
        <PremiumModal
          open={premiumModal.open}
          onClose={() => setPremiumModal({ open: false })}
          onUpgrade={handleUpgradeClick}
          shelfName={premiumModal.shelfName}
        />
      </div>
    </div>
  );
} 