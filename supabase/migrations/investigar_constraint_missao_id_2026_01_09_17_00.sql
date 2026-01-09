-- INVESTIGAR CONSTRAINT MISSAO_ID NA TABELA MOVIMENTOS
-- Descobrir por que missao_id é obrigatório

-- 1. VERIFICAR ESTRUTURA COMPLETA DA TABELA
SELECT 
  'ESTRUTURA COMPLETA:' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINTS NOT NULL
SELECT 
  'CONSTRAINTS NOT NULL:' as info,
  column_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
  AND is_nullable = 'NO'
ORDER BY column_name;

-- 3. VERIFICAR SE MISSAO_ID DEVERIA SER NULLABLE
-- Para movimentos de animais, missao_id pode não ser necessário
SELECT 
  'VERIFICAR MISSAO_ID:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
  AND column_name = 'missao_id';

-- 4. VERIFICAR FOREIGN KEYS RELACIONADAS
SELECT 
  'FOREIGN KEYS:' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'movimentos_financeiros_2025_12_29_07_00'
  AND kcu.column_name = 'missao_id';

-- 5. VERIFICAR SE HÁ DADOS EXISTENTES COM MISSAO_ID NULL
SELECT 
  'DADOS COM MISSAO_ID NULL:' as info,
  COUNT(*) as total_com_missao_null
FROM movimentos_financeiros_2025_12_29_07_00
WHERE missao_id IS NULL;