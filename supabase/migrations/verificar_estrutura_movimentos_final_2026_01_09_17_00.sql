-- VERIFICAR ESTRUTURA DA TABELA MOVIMENTOS_FINANCEIROS
-- Descobrir qual tabela realmente existe e tem a estrutura correta

-- 1. VERIFICAR TODAS AS TABELAS DE MOVIMENTOS
SELECT 
  'TABELAS MOVIMENTOS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name LIKE '%movimentos%financeiros%'
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA SEM TIMESTAMP
SELECT 
  'ESTRUTURA movimentos_financeiros:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA COM TIMESTAMP
SELECT 
  'ESTRUTURA movimentos_financeiros_2025_12_29_07_00:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;