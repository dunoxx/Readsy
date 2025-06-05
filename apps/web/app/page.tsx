import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Bem-vindo ao Readsy</h1>
        <p className="text-lg mb-8">
          Gerencie suas leituras de forma simples e eficiente
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md"
          >
            Registrar
          </Link>
        </div>
      </div>
    </main>
  );
} 