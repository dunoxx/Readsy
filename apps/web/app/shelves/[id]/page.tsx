"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, Star, Edit2, Plus, ArrowLeft, Bookmark, CheckCircle, Heart } from "lucide-react";
import Link from "next/link";
import { HeaderWithMenu } from '../page';
import { shelfApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { BookModal } from '@/components/BookModal';
import { FavoriteButton } from '@/components/FavoriteButton';
import { WishlistButton } from '@/components/WishlistButton';

// Funções utilitárias para API
async function fetchShelf(id: string) {
  console.log('🔍 Buscando estante:', id);
  const res = await shelfApi.get(id);
  console.log('✅ Estante encontrada:', res.data);
  return res.data;
}

async function fetchBooks(shelfId: string) {
  console.log('🔍 Buscando livros da estante:', shelfId);
  const res = await shelfApi.listBooks(shelfId);
  console.log('✅ Livros encontrados:', res.data);
  return res.data;
}

async function addBook(shelfId: string, book: any, userData?: any) {
  console.log('🚀 Adicionando livro:', book);
  // Primeiro criar o livro
  const bookRes = await shelfApi.createBook(book);
  console.log('✅ Livro criado:', bookRes.data);
  
  // Depois adicionar à estante com dados do usuário
  const shelfRes = await shelfApi.addBookToShelf(shelfId, { 
    bookId: bookRes.data.id,
    read: userData?.read || false,
    rating: userData?.rating || null,
  });
  console.log('✅ Livro adicionado à estante:', shelfRes.data);
  
  return bookRes.data;
}

async function deleteBook(shelfId: string, bookId: string) {
  console.log('🗑️ Removendo livro:', bookId);
  const res = await shelfApi.deleteBook(shelfId, bookId);
  console.log('✅ Livro removido');
  return res.data;
}



export default function ShelfDetailPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [drawerBook, setDrawerBook] = useState<any | undefined>(undefined);
  const [shelfName, setShelfName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const shelfId = params?.id as string;

  console.log('🔍 ShelfDetailPage - shelfId:', shelfId);

  useEffect(() => {
    if (!shelfId) {
      setError('ID da estante não encontrado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('📥 Carregando dados da estante:', shelfId);
    
    Promise.all([
      fetchShelf(shelfId),
      fetchBooks(shelfId),
    ]).then(([shelf, books]) => {
      console.log('✅ Dados carregados:', { shelf, books });
      setShelfName(shelf.name || 'Estante');
      // Mapear os campos do backend para o formato esperado pelo frontend
      const mappedBooks = (books || []).map((book: any) => {
        console.log('📖 Mapeando livro:', book);
        return {
          id: book.id,
          name: book.title, // Backend usa 'title', frontend espera 'name'
          author: book.author,
          isbn: book.isbn,
          coverUrl: book.coverUrl,
          publisher: book.category || '', // Usar category como publisher
          pages: book.totalPages, // Backend usa 'totalPages', frontend espera 'pages'
          edition: '', // Não temos edition no backend
          rating: book.userRating || 0, // Usar userRating do BookOnShelf
          read: book.read || false, // Usar read do BookOnShelf
          favorite: false, // Não temos este campo no backend ainda
        };
      });
      console.log('📚 Livros mapeados:', mappedBooks);
      setBooks(mappedBooks);
    }).catch((error) => {
      console.error('❌ Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da estante');
      toast.error('Erro ao carregar dados da estante');
    }).finally(() => setLoading(false));
  }, [shelfId]);

  // Função para salvar livro (criação ou edição)
  const handleSaveBook = async (book: any) => {
    setLoading(true);
    try {
      console.log('🚀 Salvando livro:', book);
      console.log('📚 Livros atuais:', books);
      
      // Verificar se é edição (livro já existe na lista)
      const existingBook = books.find(b => b.id === book.id);
      console.log('🔍 Livro existente:', existingBook);
      
      if (existingBook) {
        console.log('✏️ Editando livro existente');
        // Edição: atualiza os campos editáveis no backend
        await shelfApi.updateBook(shelfId, book.id, {
          read: book.read,
          rating: book.rating,
        });
        // Atualiza o estado local
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, read: book.read, rating: book.rating } : b));
        toast.success('Livro atualizado com sucesso!');
      } else {
        console.log('➕ Adicionando novo livro');
        // Adição: cria no backend e adiciona ao estado local
        const bookForBackend = {
          title: book.name,
          author: book.author,
          isbn: book.isbn,
          coverUrl: book.coverUrl,
          category: book.publisher,
          totalPages: book.pages || undefined,
        };
        const saved = await addBook(shelfId, bookForBackend, {
          read: book.read,
          rating: book.rating,
        });
        const mappedSaved = {
          id: saved.id,
          name: saved.title,
          author: saved.author,
          isbn: saved.isbn,
          coverUrl: saved.coverUrl,
          publisher: saved.category || '',
          pages: saved.totalPages,
          edition: '',
          rating: book.rating || 0,
          read: book.read || false,
          favorite: false,
        };
        setBooks(prev => [...prev, mappedSaved]);
        toast.success('Livro adicionado com sucesso!');
      }
      setDrawerBook(undefined);
      // Atualizar lista de estantes na página principal
      if (window && window.localStorage) {
        window.localStorage.setItem('refreshShelves', Date.now().toString());
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar livro:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar livro';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <HeaderWithMenu active="shelves" />
      <div className="container-custom mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/shelves" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <ArrowLeft className="w-6 h-6 text-slate-500 dark:text-slate-300" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Livros da Estante <span className="font-normal text-blue-600 dark:text-blue-400">/ {shelfName}</span>
            </h1>
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setDrawerBook(null)}
          >
            <Plus className="w-5 h-5" /> Novo Livro
          </button>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-12">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg text-slate-500 dark:text-slate-400">Carregando estante...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12 text-red-500 dark:text-red-400">
              <p className="text-lg mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Tentar Novamente
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg mb-4">Nenhum livro encontrado na estante.</p>
              <button 
                onClick={() => setDrawerBook(null)} 
                className="btn-primary"
              >
                Adicionar Primeiro Livro
              </button>
            </div>
          ) : (
            books.map((book) => (
              <li key={book.id} className="relative group">
                <div className="flex flex-row rounded-2xl shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 h-full min-h-[220px] relative group transition-all">
                  {/* Capa do livro */}
                  <div className="flex flex-col items-center w-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 mr-6 p-2 relative">
                    {/* Botões de ação sobrepostos */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <FavoriteButton bookId={book.id} size="sm" />
                      <WishlistButton bookId={book.id} size="sm" />
                    </div>
                    {/* Container da imagem com altura fixa */}
                    <div className="w-full h-36 rounded-lg overflow-hidden">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                    {/* Estrelas abaixo da imagem */}
                    <div className="flex items-center gap-1 mt-2">
                      {renderStars(book.rating || 0, 'sm')}
                    </div>
                  </div>
                  {/* Informações do livro */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{book.name}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-1">por <span className="font-semibold">{book.author}</span></p>
                      {book.edition && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{book.edition}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-5 h-5 ${book.read ? 'text-green-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${book.read ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {book.read ? 'Lido' : 'Não lido'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 mt-4">
                        <span>ISBN: {book.isbn}</span>
                        {book.pages && <span>{book.pages} páginas</span>}
                      </div>
                      <div className="flex justify-end">
                        <button
                          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          onClick={() => setDrawerBook(book)}
                          title="Editar livro"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        <BookModal
          open={drawerBook !== undefined}
          onClose={() => setDrawerBook(undefined)}
          onSave={handleSaveBook}
          initialData={drawerBook}
        />
      </div>
    </div>
  );
}

function renderStars(rating: number, size: 'sm' | 'md' = 'md') {
  const starSize = size === 'sm' ? 'w-5 h-5' : 'w-5 h-5';
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isHalfStar = rating >= i - 0.5 && rating < i;
    const isFullStar = rating >= i;
    
    stars.push(
      <div key={i} className="relative">
        <Star
          className={`${starSize} ${isFullStar ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
        />
        {isHalfStar && (
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
          </div>
        )}
      </div>
    );
  }
  return <div className="flex gap-1">{stars}</div>;
} 