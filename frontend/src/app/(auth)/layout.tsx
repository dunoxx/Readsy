'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/config';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Espaço reservado para o logo */}
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-primary">{SITE_NAME}</h1>
            <p className="text-sm text-muted-foreground mt-1">{SITE_DESCRIPTION}</p>
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 