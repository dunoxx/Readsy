'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de idiomas suportados
export type Language = 'pt-BR' | 'en' | 'es';

// Interface do contexto
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

// Tipo para as traduções
type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [K in Language]: TranslationKeys;
};

// Traduções
const translations: Translations = {
  'pt-BR': {
    // Navigation
    'nav.home': 'Início',
    'nav.groups': 'Grupos',
    'nav.challenges': 'Desafios',
    'nav.profile': 'Perfil',
    'nav.logout': 'Sair',
    'nav.login': 'Entrar',
    'nav.register': 'Criar Conta',
    
    // Landing Page
    'landing.title': 'Readsy',
    'landing.subtitle': 'Conecte-se com leitores apaixonados e compartilhe sua jornada literária',
    'landing.login': 'Entrar na sua conta',
    'landing.google': 'Continuar com Google',
    'landing.register': 'Criar conta gratuita',
    'landing.or': 'ou',
    'landing.connect': 'Conecte-se',
    'landing.connect.desc': 'Com outros leitores',
    'landing.share': 'Compartilhe',
    'landing.share.desc': 'Suas experiências',
    'landing.already.member': 'Já é parte da nossa comunidade?',
    'landing.login.link': 'Faça login',
    
    // Dashboard
    'dashboard.create.post': 'Compartilhe sua experiência de leitura...',
    'dashboard.publish': 'Publicar',
    'dashboard.quick.actions': 'Ações Rápidas',
    'dashboard.add.book': 'Adicionar Livro',
    'dashboard.find.friends': 'Encontrar Amigos',
    'dashboard.achievements': 'Ver Conquistas',
    'dashboard.trending.books': 'Livros em Alta',
    'dashboard.recent.activity': 'Atividade Recente',
    'dashboard.books': 'Livros',
    'dashboard.followers': 'Seguidores',
    'dashboard.following': 'Seguindo',
    'dashboard.liked.post': 'curtiu seu post',
    'dashboard.commented.book': 'comentou no seu livro',
    'dashboard.started.following': 'começou a te seguir',
    
    // Common
    'common.settings': 'Configurações',
    'common.notifications': 'Notificações',
    'common.theme': 'Tema',
    'common.language': 'Idioma',
    'common.light': 'Claro',
    'common.dark': 'Escuro',
    'common.system': 'Sistema',
  },
  
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.groups': 'Groups',
    'nav.challenges': 'Challenges',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    
    // Landing Page
    'landing.title': 'Readsy',
    'landing.subtitle': 'Connect with passionate readers and share your literary journey',
    'landing.login': 'Sign in to your account',
    'landing.google': 'Continue with Google',
    'landing.register': 'Create free account',
    'landing.or': 'or',
    'landing.connect': 'Connect',
    'landing.connect.desc': 'With other readers',
    'landing.share': 'Share',
    'landing.share.desc': 'Your experiences',
    'landing.already.member': 'Already part of our community?',
    'landing.login.link': 'Sign in',
    
    // Dashboard
    'dashboard.create.post': 'Share your reading experience...',
    'dashboard.publish': 'Publish',
    'dashboard.quick.actions': 'Quick Actions',
    'dashboard.add.book': 'Add Book',
    'dashboard.find.friends': 'Find Friends',
    'dashboard.achievements': 'View Achievements',
    'dashboard.trending.books': 'Trending Books',
    'dashboard.recent.activity': 'Recent Activity',
    'dashboard.books': 'Books',
    'dashboard.followers': 'Followers',
    'dashboard.following': 'Following',
    'dashboard.liked.post': 'liked your post',
    'dashboard.commented.book': 'commented on your book',
    'dashboard.started.following': 'started following you',
    
    // Common
    'common.settings': 'Settings',
    'common.notifications': 'Notifications',
    'common.theme': 'Theme',
    'common.language': 'Language',
    'common.light': 'Light',
    'common.dark': 'Dark',
    'common.system': 'System',
  },
  
  'es': {
    // Navigation
    'nav.home': 'Inicio',
    'nav.groups': 'Grupos',
    'nav.challenges': 'Desafíos',
    'nav.profile': 'Perfil',
    'nav.logout': 'Salir',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    
    // Landing Page
    'landing.title': 'Readsy',
    'landing.subtitle': 'Conéctate con lectores apasionados y comparte tu viaje literario',
    'landing.login': 'Iniciar sesión en tu cuenta',
    'landing.google': 'Continuar con Google',
    'landing.register': 'Crear cuenta gratuita',
    'landing.or': 'o',
    'landing.connect': 'Conéctate',
    'landing.connect.desc': 'Con otros lectores',
    'landing.share': 'Comparte',
    'landing.share.desc': 'Tus experiencias',
    'landing.already.member': '¿Ya eres parte de nuestra comunidad?',
    'landing.login.link': 'Iniciar sesión',
    
    // Dashboard
    'dashboard.create.post': 'Comparte tu experiencia de lectura...',
    'dashboard.publish': 'Publicar',
    'dashboard.quick.actions': 'Acciones Rápidas',
    'dashboard.add.book': 'Agregar Libro',
    'dashboard.find.friends': 'Encontrar Amigos',
    'dashboard.achievements': 'Ver Logros',
    'dashboard.trending.books': 'Libros Populares',
    'dashboard.recent.activity': 'Actividad Reciente',
    'dashboard.books': 'Libros',
    'dashboard.followers': 'Seguidores',
    'dashboard.following': 'Siguiendo',
    'dashboard.liked.post': 'le gustó tu publicación',
    'dashboard.commented.book': 'comentó en tu libro',
    'dashboard.started.following': 'comenzó a seguirte',
    
    // Common
    'common.settings': 'Configuraciones',
    'common.notifications': 'Notificaciones',
    'common.theme': 'Tema',
    'common.language': 'Idioma',
    'common.light': 'Claro',
    'common.dark': 'Oscuro',
    'common.system': 'Sistema',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt-BR');

  const availableLanguages = [
    { code: 'pt-BR' as Language, name: 'Português', flag: '🇧🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  ];

  useEffect(() => {
    // Carregar idioma do localStorage
    const savedLanguage = localStorage.getItem('readsy-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language;
      if (browserLang.startsWith('pt')) {
        setCurrentLanguage('pt-BR');
      } else if (browserLang.startsWith('es')) {
        setCurrentLanguage('es');
      } else {
        setCurrentLanguage('en');
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('readsy-language', language);
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage];
    return translation[key] || key;
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 