import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useTheme } from '@/contexts/ThemeContext';

interface ShelfModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  onDelete?: (id: string) => void;
}

const COLORS = [
  'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-orange-200', 'bg-gray-200',
];

// Estrutura simplificada de categorias de emoji (exemplo, pode ser expandida)
const EMOJI_CATEGORIES = [
  {
    name: 'Emoticons e Pessoas',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹','👺','💀','👻','👽','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  },
  {
    name: 'Animais e Natureza',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦥','🦦','🦨','🦡','🐁','🐀','🐇','🐿️','🦔'],
  },
  {
    name: 'Comida e Bebida',
    emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊'],
  },
  // ... outras categorias ...
];

const shelfSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(32, 'Máximo 32 caracteres'),
  emoji: z.string().min(1, 'Escolha um emoji').max(2, 'Máximo 2 caracteres'),
  color: z.enum([
    'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-orange-200', 'bg-gray-200',
  ]),
  isWishlist: z.boolean(),
  isPublic: z.boolean(),
});

// Toggle Switch moderno
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{label}</span>
      <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <span className="block w-10 h-6 bg-gray-200 rounded-full shadow-inner peer-checked:bg-blue-500 transition" />
        <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-4 shadow" />
      </span>
    </label>
  );
}

export function ShelfModal({ open, onClose, onSave, initialData, onDelete }: ShelfModalProps) {
  const [form, setForm] = useState({
    name: '',
    emoji: '📚',
    color: COLORS[0],
    isWishlist: false,
    isPublic: false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [emojiTone, setEmojiTone] = useState(''); // Para seleção de tom de pele futuramente
  const emojiInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { theme } = useTheme ? useTheme() : { theme: 'light' };

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => setDrawerOpen(true), 10); // Garante transição após mount
    } else {
      setDrawerOpen(false);
      const timeout = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        emoji: initialData.emoji || '📚',
        color: initialData.color || COLORS[0],
        isWishlist: !!initialData.isWishlist,
        isPublic: !!initialData.isPublic,
      });
    } else {
      setForm({ name: '', emoji: '📚', color: COLORS[0], isWishlist: false, isPublic: false });
    }
    setErrors({});
  }, [initialData, open]);

  if (!isVisible) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const result = shelfSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        if (typeof err.path[0] === 'string') fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    // Se estiver editando, inclua o id no objeto enviado
    if (initialData && initialData.id) {
      await onSave({ ...form, id: initialData.id });
    } else {
      await onSave(form);
    }
    setSaving(false);
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () => {
    if (!initialData?.id) return;
    onDelete?.(initialData.id);
    setShowDeleteConfirm(false);
  };
  const cancelDelete = () => setShowDeleteConfirm(false);

  // Filtrar emojis por busca
  const filteredCategories = emojiSearch
    ? EMOJI_CATEGORIES.map(cat => ({
        ...cat,
        emojis: cat.emojis.filter(e => e.includes(emojiSearch)),
      })).filter(cat => cat.emojis.length > 0)
    : EMOJI_CATEGORIES;

  // Drawer classes
  const drawerBase = `fixed top-0 right-0 z-[9999] h-screen w-full max-w-md p-8 overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl flex flex-col gap-8 rounded-l-2xl border-l border-slate-100 dark:border-slate-800
    transition-transform duration-500 ease-in-out
    ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`;

  // Overlay classes
  const overlayBase = `fixed inset-0 z-[9998] bg-black bg-opacity-40 transition-opacity duration-500 ease-in-out ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;

  return (
    <div className={overlayBase}>
      {isVisible && (
        <div className={drawerBase} tabIndex={-1} aria-labelledby="drawer-right-label">
          <div className="flex items-center justify-between mb-6">
            <h2 id="drawer-right-label" className="inline-flex items-center text-xl font-bold text-gray-700 dark:text-gray-200">
              <span className="mr-2">{initialData ? 'Editar Estante' : 'Nova Estante'}</span>
            </h2>
            <button type="button" onClick={onClose} aria-label="Fechar" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-lg w-8 h-8 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white">
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">
            {/* Emoji + Nome */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="w-20 h-20 flex items-center justify-center text-4xl bg-gray-100 dark:bg-slate-800 rounded-full border-2 border-transparent hover:border-blue-400 focus:border-blue-500 transition-all shadow"
                onClick={() => setShowEmojiPicker(true)}
                aria-label="Escolher emoji"
              >
                {form.emoji}
              </button>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`input w-full text-lg font-semibold ${errors.name ? 'border-red-500' : ''} dark:bg-slate-800 dark:text-white dark:border-slate-700`}
                  required
                  maxLength={32}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>
            {/* Cores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cor</label>
              <div className="flex space-x-2">
                {COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${form.color === color ? 'border-primary dark:border-blue-400' : 'border-transparent'} ${color}`}
                    onClick={() => setForm((prev) => ({ ...prev, color }))}
                    aria-label={color}
                  />
                ))}
              </div>
              {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
            </div>
            {/* Toggle de estante pública */}
            <div className="flex flex-col gap-2 mt-2">
              <Toggle
                checked={!form.isPublic}
                onChange={v => setForm(prev => ({ ...prev, isPublic: !v }))}
                label="Estante privada"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">Se ativado, apenas você poderá ver esta estante.</span>
            </div>
            {/* Emoji Picker EmojiMart */}
            {showEmojiPicker && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40" onClick={() => setShowEmojiPicker(false)}>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-0 max-w-xs w-full relative" onClick={e => e.stopPropagation()}>
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl z-10" onClick={() => setShowEmojiPicker(false)}>&times;</button>
                  <Picker
                    data={data}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    customColors={{
                      background: theme === 'dark' ? '#0f172a' : '#fff', // dark:bg-slate-900, light:bg-white
                      border: theme === 'dark' ? '#334155' : '#e5e7eb', // dark:border-slate-800, light:border-slate-200
                      text: theme === 'dark' ? '#e0e7ef' : '#1e293b', // dark:text-slate-200, light:text-slate-800
                      picker: '#4f9dde', // Readsy blue
                      icon: '#4f9dde',
                      input: theme === 'dark' ? '#1e293b' : '#f1f5f9', // dark:bg-slate-800, light:bg-slate-100
                      search: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                    }}
                    onEmojiSelect={(emoji: any) => {
                      setForm(prev => ({ ...prev, emoji: emoji.native }));
                      setShowEmojiPicker(false);
                    }}
                    previewPosition="none"
                    searchPosition="none"
                    perLine={8}
                    maxFrequentRows={1}
                    skinTonePosition="none"
                    navPosition="top"
                    locale="pt"
                  />
                </div>
              </div>
            )}
            {/* Botões de ação */}
            <div className="flex flex-row-reverse gap-2 mt-8">
              <button
                type="submit"
                className="btn-primary px-6 py-2 text-sm font-semibold"
                disabled={saving}
              >
                Salvar
              </button>
              <button
                type="button"
                className="btn-outline px-6 py-2 text-sm font-semibold"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
              {initialData?.id && onDelete && (
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-semibold text-red-600 hover:text-red-800 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg transition"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Excluir
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">Excluir estante</h3>
            <p className="text-slate-700 dark:text-slate-200 mb-6 text-center">Tem certeza que deseja excluir esta estante? Essa ação não pode ser desfeita.</p>
            <div className="flex gap-4 w-full justify-center">
              <button
                className="btn-outline px-6 py-2 text-sm font-semibold"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-2 text-sm font-semibold text-red-600 hover:text-red-800 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg transition"
                onClick={confirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 