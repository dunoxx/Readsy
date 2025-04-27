#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente necessárias estão definidas
 * 
 * Execução: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis do .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Variáveis críticas obrigatórias
const requiredVars = [
  'NEXT_PUBLIC_API_URL',
];

// Variáveis relacionadas ao login social (obrigatórias se login social estiver ativo)
const socialLoginVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GOOGLE_REDIRECT_URI',
];

// Verificar variáveis críticas
console.log('🔍 Verificando variáveis de ambiente do frontend...');
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
  console.error('\nPor favor, crie ou atualize seu arquivo .env.local na raiz do frontend');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis críticas estão configuradas!');
  
  // Verificar variáveis com valores padrão (não críticas)
  if (!process.env.NEXT_PUBLIC_SITE_NAME) {
    console.log('ℹ️  NEXT_PUBLIC_SITE_NAME não definida, usando valor padrão: Readsy');
  }
  
  if (!process.env.NEXT_PUBLIC_SITE_DESCRIPTION) {
    console.log('ℹ️  NEXT_PUBLIC_SITE_DESCRIPTION não definida, usando valor padrão: Sua plataforma de leitura');
  }
  
  process.exit(0);
} 