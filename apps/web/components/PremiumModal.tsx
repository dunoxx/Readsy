'use client';

import React from 'react';
import { X, Crown, Lock } from 'lucide-react';

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  shelfName?: string;
}

export function PremiumModal({ open, onClose, onUpgrade, shelfName }: PremiumModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Acesso Restrito
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                {shelfName ? (
                  <>
                    A estante <strong>"{shelfName}"</strong> está bloqueada para usuários gratuitos.
                  </>
                ) : (
                  'Você atingiu o limite de estantes para usuários gratuitos.'
                )}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Usuários gratuitos podem criar apenas 1 estante personalizada. 
                Faça upgrade para acessar todas as suas estantes e recursos premium.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Benefícios Premium:
            </h3>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li>• Estantes ilimitadas</li>
              <li>• Acesso a todas as suas estantes</li>
              <li>• Recursos avançados de organização</li>
              <li>• Suporte prioritário</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    </div>
  );
} 