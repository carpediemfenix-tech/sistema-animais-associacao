// SISTEMA DE VERIFICAÇÃO DE IMPACTO
// Este arquivo deve ser verificado antes de qualquer deploy

export const CRITICAL_MODULES = {
  AUTH: {
    files: [
      'src/contexts/AuthContext.tsx',
      'src/components/Login.tsx',
      'supabase/functions/auth_improved_2025_11_23_03_00/index.ts'
    ],
    description: 'Sistema de autenticação - CRÍTICO',
    impact: 'Quebra login de todos os usuários'
  },
  NAVIGATION: {
    files: [
      'src/App.tsx',
      'src/components/EnhancedHeader.tsx'
    ],
    description: 'Navegação principal - CRÍTICO',
    impact: 'Quebra navegação entre páginas'
  },
  DATABASE: {
    files: [
      'src/integrations/supabase/client.ts'
    ],
    description: 'Conexão com base de dados - CRÍTICO',
    impact: 'Quebra todas as funcionalidades'
  }
};

export const PRE_DEPLOY_CHECKLIST = [
  '✅ Verificar se alterações afetam módulos críticos',
  '✅ Validar login com utilizador ativo autorizado',
  '✅ Testar navegação principal',
  '✅ Verificar se Edge Functions existem',
  '✅ Confirmar que não há erros de console',
  '✅ Validar que funcionalidades existentes ainda funcionam'
];

// REGRAS DE IMPACTO
export const IMPACT_RULES = {
  // Se mexer em aprovisionamento, NÃO deve afetar auth
  ISOLATION: 'Módulos devem ser isolados - mudanças num módulo não devem quebrar outros',
  
  // Sempre testar funcionalidades críticas
  REGRESSION_TEST: 'Sempre testar login, navegação e funcionalidades básicas',
  
  // Edge Functions devem ser deployadas antes de usar
  EDGE_FUNCTIONS: 'Nunca referenciar Edge Functions que não existem',
  
  // Fallbacks devem ser robustos
  FALLBACK_ROBUST: 'Fallbacks devem funcionar independentemente'
};

console.log('🛡️ Sistema de verificação de impacto carregado');
console.log('📋 Checklist pré-deploy:', PRE_DEPLOY_CHECKLIST);
