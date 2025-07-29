'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsDropdown } from './SettingsDropdown';
import { Logo } from './Logo';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home,
  Users,
  Trophy,
  Sparkles,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Monitor,
  BookOpen
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

function NotificationDropdown() {
  // Mock de notificações
  const notifications = [
    { id: 1, type: 'Novo Seguidor', icon: <Users className="h-5 w-5 text-blue-500" />, text: 'Ana Silva começou a seguir você', read: false },
    { id: 2, type: 'XP Ganhado', icon: <Trophy className="h-5 w-5 text-yellow-500" />, text: 'Você ganhou 10 XP!', read: false },
    { id: 3, type: 'Desafio', icon: <Sparkles className="h-5 w-5 text-green-500" />, text: 'Desafio concluído!', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setOpen(!open)}
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-white dark:border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 text-lg">
            Notificações
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 && (
              <li className="px-6 py-6 text-gray-500 dark:text-gray-400 text-center">Nenhuma notificação</li>
            )}
            {notifications.map(n => (
              <li key={n.id} className={`flex items-start gap-4 px-6 py-5 ${n.read ? 'bg-gray-50 dark:bg-gray-900 text-gray-400' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                <div className="flex-shrink-0 mt-1">{n.icon}</div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{n.type}</div>
                  <div className="text-base font-medium leading-snug">{n.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UserDropdown({ user, onLogout }: { user: any, onLogout: () => void }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Ícones
  const icons = {
    profile: <User className="h-4 w-4 mr-2" />,
    logout: <LogOut className="h-4 w-4 mr-2" />,
    light: <Sun className="h-4 w-4 mr-2" />,
    dark: <Moon className="h-4 w-4 mr-2" />,
    system: <Monitor className="h-4 w-4 mr-2" />,
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Menu do usuário"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-blue-400 shadow" />
        ) : (
          <div className="w-9 h-9 bg-gradient-blue-purple rounded-full flex items-center justify-center shadow">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
        <ChevronDown className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-300" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Link para perfil */}
          <Link href="/profile" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {icons.profile}
            <span>{t('nav.profile')}</span>
          </Link>
          {/* Tema */}
          <div className="px-2 py-2">
            <div className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">{t('common.theme')}</div>
            <div className="flex flex-col gap-1">
              <button onClick={() => setTheme('light')} className={`flex items-center px-3 py-2 rounded-lg ${theme==='light'?'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400':'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{icons.light}<span>Claro</span></button>
              <button onClick={() => setTheme('dark')} className={`flex items-center px-3 py-2 rounded-lg ${theme==='dark'?'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400':'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{icons.dark}<span>Escuro</span></button>
              <button onClick={() => setTheme('system')} className={`flex items-center px-3 py-2 rounded-lg ${theme==='system'?'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400':'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{icons.system}<span>Auto</span></button>
            </div>
          </div>
          {/* Sair */}
          <button
            onClick={onLogout}
            className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg font-semibold"
          >
            {icons.logout}
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-slate-900 bg-opacity-90 dark:bg-opacity-90 shadow-soft border-b border-white dark:border-slate-700 border-opacity-20 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="group">
            <Logo size="lg" showText={false} className="group-hover:scale-105 transition-transform duration-200" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <UserDropdown user={user} onLogout={handleLogout} />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <SettingsDropdown />
                <Link href="/auth/login" className="nav-link">
                  {t('nav.login')}
                </Link>
                <Link href="/auth/register" className="btn-primary group">
                  <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationDropdown />
            <UserDropdown user={user} onLogout={handleLogout} />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-readsy-blue hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-slate-100 dark:border-slate-700">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 px-3">
                  <NotificationDropdown />
                  <UserDropdown user={user} onLogout={handleLogout} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="block p-3 rounded-xl text-slate-700 dark:text-slate-200 hover:text-readsy-blue hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 dark:from-readsy-blue dark:to-blue-600 text-white font-medium shadow-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 