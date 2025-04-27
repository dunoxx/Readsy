'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { GoogleButton } from '@/components/auth/google-button';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
        <p className="text-sm text-muted-foreground">
          Entre com seu e-mail e senha para acessar sua conta
        </p>
      </div>

      <LoginForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">ou continue com</span>
        </div>
      </div>

      <GoogleButton onClick={loginWithGoogle} text="Entrar com Google" />

      <div className="text-center text-sm">
        Não tem uma conta?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
} 