-- VERIFICAR E CORRIGIR TABELAS DE MOVIMENTOS FINANCEIROS
-- Problema: Frontend usa tabela antiga/inexistente

-- 1. VERIFICAR TODAS AS TABELAS DE MOVIMENTOS FINANCEIROS
SELECT 
  'TABELAS DE MOVIMENTOS FINANCEIROS:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%movimentos_financeiros%'
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA CORRETA (sugerida pelo hint)
SELECT 
  'ESTRUTURA movimentos_financeiros_2025_12_29_07_00:' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE A TABELA ANTIGA EXISTE
SELECT 
  'TABELA ANTIGA movimentos_financeiros_2025_12_13_06_00:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'movimentos_financeiros_2025_12_13_06_00'
    ) 
    THEN 'EXISTS' 
    ELSE 'NOT_EXISTS' 
  END as status;

-- 4. VERIFICAR SE A TABELA NOVA EXISTE
SELECT 
  'TABELA NOVA movimentos_financeiros_2025_12_29_07_00:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
    ) 
    THEN 'EXISTS' 
    ELSE 'NOT_EXISTS' 
  END as status;

-- 5. VERIFICAR DADOS NA TABELA CORRETA
SELECT 
  'DADOS NA TABELA CORRETA:' as info,
  COUNT(*) as total_registos
FROM movimentos_financeiros_2025_12_29_07_00;

-- 6. VERIFICAR RELACIONAMENTOS DA TABELA DE INTERVENÇÕES
SELECT 
  'RELACIONAMENTOS INTERVENCOES:' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'intervencoes';

-- 7. VERIFICAR NOMES CORRETOS DAS TABELAS RELACIONADAS
SELECT 
  'TABELAS RELACIONADAS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_name IN ('clinicas_veterinarias', 'tipos_intervencoes', 'clinicas', 'tipos_intervencao')
ORDER BY table_name;