#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente necessárias estão definidas
 * 
 * Execução: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis do .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Variáveis críticas obrigatórias
const requiredVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// Variáveis relacionadas ao login social (obrigatórias se login social estiver ativo)
const socialLoginVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
];

// Verificar variáveis críticas
console.log('🔍 Verificando variáveis de ambiente...');
let missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

// Verificar variáveis de login social
const hasSocialLoginVars = socialLoginVars.some(varName => !!process.env[varName]);

if (hasSocialLoginVars) {
  socialLoginVars.forEach(varName => {
    if (!process.env[varName]) {
      console.warn(`⚠️  Login social (Google) pode estar parcialmente configurado. Faltando: ${varName}`);
    }
  });
}

// Mostrar resultados
if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente críticas não definidas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPor favor, crie ou atualize seu arquivo .env na raiz do projeto');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis críticas estão configuradas!');
  
  // Verificar variáveis com valores padrão (não críticas)
  if (!process.env.PORT) {
    console.log('ℹ️  PORT não definida, usando valor padrão: 3001');
  }
  
  if (!process.env.FRONTEND_URL) {
    console.log('ℹ️  FRONTEND_URL não definida, usando valor padrão: http://localhost:3000');
  }
  
  // Verificar variáveis de gamificação
  if (!process.env.GAMIFICATION_MAX_LEVEL) {
    console.log('ℹ️  GAMIFICATION_MAX_LEVEL não definida, usando valor padrão: 10');
  }
  
  if (!process.env.GAMIFICATION_MAX_XP) {
    console.log('ℹ️  GAMIFICATION_MAX_XP não definida, usando valor padrão: 5500');
  }
  
  process.exit(0);
} 