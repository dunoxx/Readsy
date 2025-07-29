import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, X, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SuggestBookModal } from './SuggestBookModal';

interface BookModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

// Busca livros: Google Books, OpenLibrary
async function searchBooks(query: string, page: number = 1) {
  if (!query || query.length < 3) return [];
  console.log('🔍 Buscando livros:', query, 'página:', page);
  
  let results: any[] = [];
  const maxResults = 10;
  const startIndex = (page - 1) * maxResults;

  // 1. Google Books
  try {
    const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}`);
    const gData = await gRes.json();
    if (gData.items && gData.items.length > 0) {
      const googleResults = gData.items.map((item: any) => {
        const info = item.volumeInfo;
        return {
          id: item.id,
          name: info.title,
          author: (info.authors && info.authors.join(', ')) || '',
          isbn: (info.industryIdentifiers && info.industryIdentifiers[0]?.identifier) || '',
          coverUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
          publisher: info.publisher || '',
          pages: info.pageCount || '',
          edition: info.publishedDate || '',
          source: 'google',
        };
      });
      results = results.concat(googleResults);
    }
  } catch (error) {
    console.error('❌ Erro na busca Google Books:', error);
  }

  // 2. OpenLibrary
  try {
    const oRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}&offset=${startIndex}`);
    const oData = await oRes.json();
    if (oData.docs && oData.docs.length > 0) {
      const olResults = oData.docs.slice(0, maxResults).map((doc: any) => ({
        id: doc.key,
        name: doc.title,
        author: (doc.author_name && doc.author_name.join(', ')) || '',
        isbn: (doc.isbn && doc.isbn[0]) || '',
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
        publisher: (doc.publisher && doc.publisher[0]) || '',
        pages: doc.number_of_pages_median || '',
        edition: doc.first_publish_year ? `${doc.first_publish_year}` : '',
        source: 'openlibrary',
      }));
      results = results.concat(olResults);
    }
  } catch (error) {
    console.error('❌ Erro na busca OpenLibrary:', error);
  }

  // Remover duplicatas baseado no ISBN
  const uniqueResults = results.filter((book, index, self) => 
    index === self.findIndex(b => b.isbn === book.isbn)
  );

  return uniqueResults.slice(0, maxResults);
}

export function BookModal({ open, onClose, onSave, initialData }: BookModalProps) {
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    name: '',
    author: '',
    isbn: '',
    coverUrl: '',
    publisher: '',
    pages: '',
    edition: '',
    rating: 0,
    read: false,
    favorite: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [bookSelected, setBookSelected] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const [isVisible, setIsVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setDrawerOpen(true), 10);
    } else {
      setDrawerOpen(false);
      const timeout = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      console.log('📖 BookModal - initialData recebido:', initialData);
      setForm({
        id: initialData.id, // Preservar o ID para edição
        name: initialData.name || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        coverUrl: initialData.coverUrl || '',
        publisher: initialData.publisher || '',
        pages: initialData.pages || '',
        edition: initialData.edition || '',
        rating: initialData.rating || 0,
        read: initialData.read || false,
        favorite: initialData.favorite || false,
      });
      setBookSelected(true);
      setSearchQuery(initialData.name || '');
    } else {
      setForm({
        id: undefined, // Sem ID para novo livro
        name: '',
        author: '',
        isbn: '',
        coverUrl: '',
        publisher: '',
        pages: '',
        edition: '',
        rating: 0,
        read: false,
        favorite: false,
      });
      setBookSelected(false);
      setSearchQuery('');
    }
  }, [initialData, open]);

  const handleSearch = async (query: string, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setSearchQuery(query);
      setCurrentPage(1);
    }
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(async () => {
      if (query.length < 3) {
        setSearchResults([]);
        setHasMoreResults(true);
        return;
      }
      
      setSearching(true);
      try {
        const page = isLoadMore ? currentPage + 1 : 1;
        const results = await searchBooks(query, page);
        
        if (isLoadMore) {
          setSearchResults(prev => [...prev, ...results]);
          setCurrentPage(page);
        } else {
          setSearchResults(results);
          setCurrentPage(1);
        }
        
        // Verificar se há mais resultados (se retornou menos que o máximo)
        setHasMoreResults(results.length === 10);
      } catch (error) {
        console.error('Erro na busca:', error);
        setSearchResults([]);
        setHasMoreResults(false);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleLoadMore = () => {
    if (searchQuery.length >= 3 && hasMoreResults && !searching) {
      handleSearch(searchQuery, true);
    }
  };

  const handleSelectBook = (book: any) => {
    setForm({
      id: book.id,
      name: book.name,
      author: book.author,
      isbn: book.isbn,
      coverUrl: book.coverUrl,
      publisher: book.publisher,
      pages: book.pages,
      edition: book.edition,
      rating: form.rating,
      read: form.read,
      favorite: form.favorite,
    });
    setBookSelected(true);
    setSearchResults([]);
    toast.success('Livro selecionado!');
  };

  const handleClearSelection = () => {
    setBookSelected(false);
    setForm({
      id: undefined,
      name: '',
      author: '',
      isbn: '',
      coverUrl: '',
      publisher: '',
      pages: '',
      edition: '',
      rating: form.rating,
      read: form.read,
      favorite: form.favorite,
    });
    setSearchQuery('');
    setSearchResults([]);
    setCurrentPage(1);
    setHasMoreResults(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      rating: parseFloat(e.target.value),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      toast.error('Nome do livro é obrigatório');
      return false;
    }
    if (!form.author.trim()) {
      toast.error('Autor é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestBook = () => {
    setShowSuggestModal(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          drawerOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-500 ease-in-out ${
        drawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialData ? 'Editar Livro' : 'Adicionar Livro'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de busca */}
              {!initialData && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Buscar Livro
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Digite o nome do livro..."
                      className="w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                          setCurrentPage(1);
                          setHasMoreResults(true);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Resultados da busca */}
                  {searching && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">Buscando livros...</span>
                      </div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-1 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelectBook(result)}
                          className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {result.coverUrl ? (
                              <img src={result.coverUrl} alt={result.name} className="w-8 h-12 object-cover rounded" />
                            ) : (
                              <BookOpen className="w-8 h-12 text-slate-300" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 dark:text-white">{result.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {result.author} • {result.isbn}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      
                      {/* Botão "Carregar Mais" */}
                      {hasMoreResults && (
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          disabled={searching}
                          className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-slate-200 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/10 transition-colors disabled:opacity-50"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {searching ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {searching ? 'Carregando...' : 'Carregar Mais'}
                            </span>
                          </div>
                        </button>
                      )}
                      
                      {/* Botão "Sugerir Livro" sempre no final da lista de resultados */}
                      <button
                        type="button"
                        onClick={handleSuggestBook}
                        className="w-full p-3 text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 border-t-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-12 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-orange-700 dark:text-orange-300">Sugerir Livro</div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                              Não encontrou o que procurava? Clique aqui para sugerir
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Informações do livro (apresentação visual quando selecionado) */}
              {bookSelected && (
                <>
                  {/* Card do Livro Selecionado */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                    <div className="flex items-start gap-6">
                      {/* Capa do Livro */}
                      <div className="flex-shrink-0">
                        {form.coverUrl ? (
                          <img 
                            src={form.coverUrl} 
                            alt={form.name} 
                            className="w-24 h-36 object-cover rounded-lg shadow-lg border border-slate-200 dark:border-slate-600" 
                          />
                        ) : (
                          <div className="w-24 h-36 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-300 dark:border-slate-600">
                            <BookOpen className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Informações do Livro */}
                      <div className="flex-1 space-y-4">
                        {/* Título */}
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {form.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            por <span className="font-medium text-slate-700 dark:text-slate-300">{form.author}</span>
                          </p>
                        </div>

                        {/* Detalhes do Livro */}
                        <div className="space-y-2 text-sm">
                          {form.isbn && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 min-w-[60px]">ISBN:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{form.isbn}</span>
                            </div>
                          )}
                          {form.publisher && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 min-w-[60px]">Editora:</span>
                              <span className="text-slate-700 dark:text-slate-300">{form.publisher}</span>
                            </div>
                          )}
                          {form.pages && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 min-w-[60px]">Páginas:</span>
                              <span className="text-slate-700 dark:text-slate-300">{form.pages}</span>
                            </div>
                          )}
                          {form.edition && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 min-w-[60px]">Edição:</span>
                              <span className="text-slate-700 dark:text-slate-300">{form.edition}</span>
                            </div>
                          )}
                        </div>

                        {/* Botão Limpar Seleção */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleClearSelection}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Limpar seleção
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nota Global */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Nota Global da Plataforma
                    </label>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                      <div className="text-center">
                        <div className="flex justify-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className="w-8 h-8 text-slate-300"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Sem avaliações ainda
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Seja o primeiro a avaliar este livro!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sua Nota */}
                  <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/10 dark:via-yellow-900/10 dark:to-orange-900/10 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50 shadow-sm">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                        Sua Avaliação
                      </h3>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Como você avalia este livro?
                      </p>
                    </div>

                    {/* Estrelas Grandes e Coloridas */}
                    <div className="flex justify-center mb-6">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = form.rating;
                          const filled = star <= rating;
                          const halfFilled = star - 0.5 <= rating && rating < star;
                          
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                              onMouseEnter={() => {
                                // Hover effect para preview
                              }}
                              className="group relative p-1 transition-transform duration-200 hover:scale-110"
                            >
                              <svg
                                className={`w-10 h-10 transition-all duration-300 ${
                                  filled 
                                    ? 'text-amber-500 drop-shadow-lg' 
                                    : halfFilled 
                                      ? 'text-amber-400 drop-shadow-md' 
                                      : 'text-slate-300 dark:text-slate-600 group-hover:text-amber-300'
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                {halfFilled ? (
                                  <>
                                    <defs>
                                      <clipPath id={`half-star-${star}`}>
                                        <rect x="0" y="0" width="10" height="20" />
                                      </clipPath>
                                    </defs>
                                    <path
                                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                      clipPath={`url(#half-star-${star})`}
                                    />
                                  </>
                                ) : (
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                )}
                              </svg>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                {star} {star === 1 ? 'estrela' : 'estrelas'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slider Moderno */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">0</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {form.rating} / 5
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">5</span>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.5"
                          value={form.rating}
                          onChange={handleRatingChange}
                          className="slider w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full appearance-none cursor-pointer shadow-inner"
                          style={{
                            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(form.rating / 5) * 100}%, #e5e7eb ${(form.rating / 5) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        
                        {/* Marcadores do slider */}
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
                          <span>0</span>
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback da nota */}
                    {form.rating > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-300/50 dark:border-amber-600/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                              {form.rating === 5 ? 'Excelente!' : 
                               form.rating >= 4 ? 'Muito bom!' : 
                               form.rating >= 3 ? 'Bom!' : 
                               form.rating >= 2 ? 'Regular' : 'Ruim'}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {form.rating === 5 ? 'Você adorou este livro!' : 
                               form.rating >= 4 ? 'Um livro muito recomendado' : 
                               form.rating >= 3 ? 'Uma leitura agradável' : 
                               form.rating >= 2 ? 'Não foi dos melhores' : 'Não gostou muito'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Já li este livro */}
                  <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/10 dark:via-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          form.read 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25' 
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold transition-colors duration-300 ${
                            form.read 
                              ? 'text-emerald-800 dark:text-emerald-200' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            Já li este livro
                          </h3>
                          <p className={`text-sm transition-colors duration-300 ${
                            form.read 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {form.read ? 'Parabéns! Você completou esta leitura.' : 'Marque quando terminar de ler'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Toggle Switch Moderno */}
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, read: !prev.read }))}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-inner ${
                          form.read 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25' 
                            : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
                            form.read ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Status adicional com animação */}
                    {form.read && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl border border-emerald-300/50 dark:border-emerald-600/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                              Livro marcado como lido!
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Este livro aparecerá na sua lista de leituras concluídas
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || !bookSelected}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : (initialData ? 'Salvar' : 'Adicionar')}
            </button>
          </div>
        </div>
      </div>
      <SuggestBookModal
        open={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        searchQuery={searchQuery}
      />
    </div>
  );
} 