'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, ShoppingCart, ExternalLink, Share2, User } from 'lucide-react';
import { publicWishlistApi } from '@/lib/api';
import { Logo } from '@/components/Logo';
import ShareModal from '@/components/ShareModal';
import toast from 'react-hot-toast';

interface PublicWishlistData {
  user: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  books: Array<{
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    category?: string;
    totalPages?: number;
    amazonUrl?: string;
  }>;
  booksCount: number;
}

export default function PublicWishlistPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<PublicWishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        console.log('=== FRONTEND - INÍCIO ===');
        console.log('Buscando wishlist pública com slug:', slug);
        console.log('URL atual:', window.location.href);
        
        // Testar se a API está acessível
        try {
          console.log('Testando conexão com API...');
          const testResponse = await fetch('http://localhost:3001/health', { method: 'GET' });
          console.log('Status teste API:', testResponse.status);
        } catch (testError) {
          console.error('Erro ao conectar com API:', testError);
        }
        
        const response = await publicWishlistApi.get(slug);
        console.log('Resposta da API:', response);
        
        // Verificar se é um erro HTTP
        if (response.error || response.statusCode === 404) {
          console.log('Erro na resposta:', response);
          setError('Wishlist não encontrada');
          return;
        }
        
        // Verificar se a resposta tem os dados esperados
        if (!response.user || !response.books) {
          console.log('Resposta inválida:', response);
          setError('Dados da wishlist inválidos');
          return;
        }
        
        setData(response);
      } catch (err: any) {
        console.error('=== ERRO NO FRONTEND ===');
        console.error('Erro ao carregar wishlist:', err);
        console.error('Stack trace:', err?.stack);
        setError('Erro ao carregar wishlist');
      } finally {
        console.log('=== FRONTEND - FIM ===');
        setLoading(false);
      }
    };

    if (slug) {
      fetchWishlist();
    }
  }, [slug]);

  const handleBuyNow = (amazonUrl: string, bookTitle: string) => {
    window.open(amazonUrl, '_blank');
    toast.success(`Abrindo ${bookTitle} na Amazon`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/wishlist/${slug}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} text-slate-300`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container-custom mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Carregando wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container-custom mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Wishlist não encontrada
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Esta wishlist não existe ou foi removida.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Público */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container-custom mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom mx-auto px-4 py-8">
        {/* Informações do Usuário */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {data.user.avatar ? (
              <img
                src={data.user.avatar}
                alt={data.user.displayName || data.user.username}
                className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg">
                <User className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Wishlist de {data.user.displayName || data.user.username}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {data.booksCount} {data.booksCount === 1 ? 'livro' : 'livros'} na lista de desejos
          </p>
        </div>

        {/* Lista de Livros */}
        {data.books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Wishlist vazia
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Esta wishlist ainda não possui livros.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-12">
            {data.books.map((book) => (
              <li key={book.id} className="relative group py-4 mb-4">
                <div className="flex flex-row rounded-2xl shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 h-full min-h-[220px] relative group transition-all">
                  {/* Capa do livro */}
                  <div className="flex items-center rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 mr-4 p-1 relative">
                    {/* Container da imagem com altura fixa */}
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Informações do livro */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {book.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-1">
                        por <span className="font-semibold">{book.author}</span>
                      </p>
                      {book.category && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                          {book.category}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 mt-4">
                        {book.totalPages && <span>{book.totalPages} páginas</span>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Botão de compra como continuidade do box */}
                {book.amazonUrl && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleBuyNow(book.amazonUrl!, book.title)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/25"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Comprar Agora
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer de Convite */}
      <footer className="bg-gradient-to-b from-blue-1200 via-purple-900 to-indigo-700 text-white py-16 mt-20">
        <div className="container-custom mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Ícone e Título */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Crie você também a sua wishlist!
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Junte-se à comunidade Readsy e organize seus livros favoritos de forma simples e elegante
              </p>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Organize</h3>
                <p className="text-blue-100">
                  Crie estantes personalizadas e organize seus livros por categoria
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Favoritos</h3>
                <p className="text-blue-100">
                  Marque seus livros favoritos e acompanhe o que você já leu
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Compartilhe</h3>
                <p className="text-blue-100">
                  Compartilhe suas listas com amigos e descubra novos livros
                </p>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Criar Conta Grátis
              </button>
              
              <p className="text-blue-100 text-sm">
                Já tem uma conta?{' '}
                <a 
                  href="/auth/login" 
                  className="text-white font-semibold hover:underline transition-colors"
                >
                  Faça login
                </a>
              </p>
            </div>

            {/* Estatísticas */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">10k+</div>
                  <div className="text-blue-100 text-sm">Usuários ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">50k+</div>
                  <div className="text-blue-100 text-sm">Livros organizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">100%</div>
                  <div className="text-blue-100 text-sm">Gratuito</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
        title={`Wishlist de ${data?.user.displayName || data?.user.username} no Readsy`}
        description={`Confira a lista de desejos de ${data?.user.displayName || data?.user.username} no Readsy!`}
      />
    </div>
  );
} 