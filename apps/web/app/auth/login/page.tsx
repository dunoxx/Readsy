'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import { Logo } from '@/components/Logo';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Botão voltar no canto superior esquerdo */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center space-x-2 text-white hover:text-opacity-80 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Voltar</span>
        </Link>
      </div>

      <div className="max-w-md w-full">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <Logo size="xl" showText={false} className="drop-shadow-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{t('landing.login')}</h2>
          <p className="text-white text-opacity-80">
            Entre na sua conta para continuar lendo
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label text-white">
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 pl-12 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Mail className="h-5 w-5 text-white text-opacity-70 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="form-label text-white">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pl-12 pr-12 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Lock className="h-5 w-5 text-white text-opacity-70 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-white text-opacity-70 hover:text-opacity-100 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-white text-slate-800 hover:bg-opacity-90 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white text-opacity-80">{t('landing.or')}</span>
              </div>
            </div>

            <div>
              <button
                type="button"
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
            </div>

            <div className="text-center">
              <span className="text-white text-opacity-80">Não tem uma conta? </span>
              <Link 
                href="/auth/register" 
                className="text-white hover:text-opacity-80 font-medium underline"
              >
                {t('nav.register')}
              </Link>
            </div>
          </form>
        </div>

        {/* Link para esqueci a senha */}
        <div className="text-center mt-6">
          <Link 
            href="/auth/forgot-password" 
            className="text-white text-opacity-80 hover:text-opacity-100 text-sm underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
} 