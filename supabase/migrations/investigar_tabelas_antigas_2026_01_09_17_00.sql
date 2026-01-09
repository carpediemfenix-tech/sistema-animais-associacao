-- INVESTIGAR TABELAS ANTIGAS QUE FUNCIONAVAM
-- Descobrir se ainda existem e têm dados

-- 1. VERIFICAR TODAS AS TABELAS DE MOVIMENTOS FINANCEIROS
SELECT 
  'TODAS AS TABELAS MOVIMENTOS:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%movimentos_financeiros%'
ORDER BY table_name;

-- 2. VERIFICAR SE A TABELA ANTIGA EXISTE
SELECT 
  'TABELA ANTIGA (que funcionava):' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'movimentos_financeiros_2025_12_13_06_00'
    ) 
    THEN 'EXISTS' 
    ELSE 'NOT_EXISTS' 
  END as status_tabela_antiga;

-- 3. VERIFICAR ESTRUTURA DA TABELA ANTIGA (se existir)
SELECT 
  'ESTRUTURA TABELA ANTIGA:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_13_06_00'
ORDER BY ordinal_position;

-- 4. VERIFICAR DADOS NA TABELA ANTIGA (se existir)
SELECT 
  'DADOS NA TABELA ANTIGA:' as info,
  COUNT(*) as total_registos
FROM movimentos_financeiros_2025_12_13_06_00
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'movimentos_financeiros_2025_12_13_06_00'
);

-- 5. VERIFICAR ESTRUTURA DA TABELA NOVA
SELECT 
  'ESTRUTURA TABELA NOVA:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;

-- 6. VERIFICAR DADOS NA TABELA NOVA
SELECT 
  'DADOS NA TABELA NOVA:' as info,
  COUNT(*) as total_registos
FROM movimentos_financeiros_2025_12_29_07_00;

-- 7. COMPARAR ESTRUTURAS (se ambas existirem)
SELECT 
  'COMPARAÇÃO ESTRUTURAS:' as info,
  'ANTIGA' as origem,
  column_name
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_13_06_00'
UNION ALL
SELECT 
  'COMPARAÇÃO ESTRUTURAS:' as info,
  'NOVA' as origem,
  column_name
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY column_name, origem;