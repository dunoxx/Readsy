import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/signup', '/auth/callback'];

// Rotas que sempre são públicas
const staticRoutes = [
  '/_next',
  '/favicon.ico',
  '/api/auth',
  '/images',
  '/fonts',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se é uma rota pública ou estática
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    staticRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }
  
  // Verificar se o usuário está autenticado através do token no localStorage
  // Como o middleware é executado no servidor, não temos acesso ao localStorage
  // Por isso, usamos cookies
  const isAuthenticated = request.cookies.has('readsy-auth');
  
  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Excluir todas as rotas estáticas:
     * - /_next (Next.js internals)
     * - /_static (arquivos estáticos)
     * - /_vercel (Vercel internals)
     * - /assets, /favicon.ico (arquivos estáticos)
     */
    '/((?!_next|_static|_vercel|assets|favicon.ico).*)',
  ],
}; 