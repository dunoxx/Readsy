"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const code = searchParams?.get("code");
  const state = searchParams?.get("state");
  
  useEffect(() => {
    // Verificar se temos o código de autenticação
    if (!code) {
      setError("Erro durante a autenticação. Código não recebido.");
      return;
    }
    
    // Processar o callback do Google
    const processCallback = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        
        // Trocar o código por tokens de acesso
        const response = await axios.get(`${API_URL}/auth/google/callback`, {
          params: { code, state }
        });
        
        const { accessToken, refreshToken } = response.data;
        
        // Buscar informações do usuário
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Atualizar o estado de autenticação
        useAuthStore.setState({
          user: userResponse.data,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        
        // Redirecionar para o dashboard
        router.push("/dashboard");
      } catch (err) {
        console.error("Erro ao processar callback:", err);
        setError("Erro ao processar a autenticação. Tente novamente.");
      }
    };
    
    processCallback();
  }, [code, state, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        {error ? (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Erro de autenticação
            </h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="text-primary hover:underline"
            >
              Voltar para login
            </button>
          </div>
        ) : (
          <div>
            <Spinner size="lg" className="mb-6" />
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Autenticando
            </h2>
            <p className="text-muted-foreground">
              Estamos processando seu login. Por favor, aguarde...
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 