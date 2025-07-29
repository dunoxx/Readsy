'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { BookOpen } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  forceTheme?: 'light' | 'dark'; // Força o logo para um tema específico
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10', 
  lg: 'w-24 h-24',
  xl: 'w-48 h-48',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8', 
  xl: 'h-12 w-12',
};

export function Logo({ size = 'md', showText = true, className = '', forceTheme }: LogoProps) {
  const { theme } = useTheme();
  const [imageError, setImageError] = React.useState(false);

  // Corrige a escolha do logo conforme o tema
  const currentTheme = forceTheme || theme;
  const logoPath = currentTheme === 'dark'
    ? '/images/logos/logo-dark.png'
    : '/images/logos/logo-light.png';

  const handleImageError = () => {
    setImageError(true);
  };

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} bg-gradient-blue-purple rounded-xl flex items-center justify-center shadow-lg`}>
      <BookOpen className={`${iconSizes[size]} text-white`} />
    </div>
  );

  const LogoImage = () => (
    <div className={`${sizeClasses[size]} relative`}>
      <Image
        src={logoPath}
        alt="Readsy Logo"
        fill
        className="object-contain"
        onError={handleImageError}
        priority
      />
    </div>
  );

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo/Ícone */}
      {imageError ? <LogoIcon /> : <LogoImage />}
      
      {/* Texto */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            Readsy
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
              Sua jornada literária
            </span>
          )}
        </div>
      )}
    </div>
  );
} 