import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono lg:flex">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold mb-6">Bem-vindo ao Readsy</h1>
          <p className="text-xl mb-8">Sua plataforma de controle de leitura gamificada</p>
          
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/login">
                Entrar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">
                Registrar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 