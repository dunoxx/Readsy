'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import { Logo } from '@/components/Logo';
import { ArrowRight, Sparkles, Users, Heart } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Se usuário já está logado, redireciona para o dashboard
  if (isAuthenticated) {
    redirect('/dashboard');
  }

  const handleGoogleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-blue-purple dark:bg-gradient-blue-purple-dark flex items-center justify-center p-4 relative">
      {/* Settings dropdown no canto superior direito */}
      <div className="absolute top-6 right-6 z-10">
        <SettingsDropdown />
      </div>

      <div className="max-w-md w-full">
        {/* Logo e Branding */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-10">
            <Logo size="xl" showText={false} className="drop-shadow-2xl" />
          </div>
          
          <p className="text-lg text-white text-opacity-90 leading-relaxed">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 p-8 mb-6">
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-white text-slate-800 hover:bg-opacity-90 shadow-lg hover:shadow-xl"
            >
              <span>{t('landing.login')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-white bg-opacity-20 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-opacity-30 shadow-lg hover:shadow-xl"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{t('landing.google')}</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white text-opacity-80">{t('landing.or')}</span>
              </div>
            </div>

            <Link
              href="/auth/register"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-readsy-yellow text-slate-800 hover:bg-yellow-400 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('landing.register')}</span>
            </Link>
          </div>
        </div>

        {/* Features em destaque */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white border-opacity-20">
            <Users className="h-6 w-6 text-readsy-blue mx-auto mb-2" />
            <p className="text-sm font-medium text-white">{t('landing.connect')}</p>
            <p className="text-xs text-white text-opacity-80">{t('landing.connect.desc')}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white border-opacity-20">
            <Heart className="h-6 w-6 text-readsy-red mx-auto mb-2" />
            <p className="text-sm font-medium text-white">{t('landing.share')}</p>
            <p className="text-xs text-white text-opacity-80">{t('landing.share.desc')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-white text-opacity-80">
          <p>{t('landing.already.member')} 
            <Link href="/auth/login" className="text-white hover:text-opacity-80 font-medium ml-1 underline">
              {t('landing.login.link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 