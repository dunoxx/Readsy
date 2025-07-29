'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function TestPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔍 TestPage - Estado da autenticação:', {
      user,
      isAuthenticated,
      isLoading
    });
  }, [user, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Página de Teste - Estado da Autenticação
        </h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Estado Atual:</h2>
          
          <div className="space-y-4">
            <div>
              <strong>isLoading:</strong> {isLoading ? 'true' : 'false'}
            </div>
            
            <div>
              <strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}
            </div>
            
            <div>
              <strong>user:</strong>
              <pre className="bg-slate-100 dark:bg-slate-700 p-4 rounded mt-2 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Links de Teste:</h3>
            <div className="space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </a>
              <a href="/shelves" className="text-blue-600 hover:underline">
                Estantes
              </a>
              <a href="/" className="text-blue-600 hover:underline">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 