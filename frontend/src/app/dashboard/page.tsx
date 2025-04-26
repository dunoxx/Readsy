"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import Header from "@/components/layout/header";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e não estiver autenticado, redireciona para login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Painel Principal</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium mb-4">Bem-vindo, {user?.displayName}!</h2>
            <p className="text-muted-foreground">
              Esta é a sua área pessoal do Readsy, onde você pode gerenciar suas leituras,
              participar de desafios e acompanhar seu progresso.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium mb-4">Leituras Recentes</h2>
            <p className="text-muted-foreground">
              Você ainda não registrou nenhuma leitura. Comece adicionando um livro
              e registrando seu progresso de leitura.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium mb-4">Desafios Ativos</h2>
            <p className="text-muted-foreground">
              Você não está participando de nenhum desafio atualmente.
              Participe de desafios para manter sua motivação de leitura.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 