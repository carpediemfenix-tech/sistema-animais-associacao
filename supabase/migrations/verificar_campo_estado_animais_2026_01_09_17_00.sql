-- VERIFICAR ESTRUTURA DA TABELA ANIMAIS E CAMPO ESTADO
-- Identificar se o campo existe e suas configurações

-- 1. VERIFICAR ESTRUTURA COMPLETA DA TABELA ANIMAIS
SELECT 
  'ESTRUTURA TABELA ANIMAIS:' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animais'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTE CAMPO ESTADO OU SIMILAR
SELECT 
  'CAMPOS RELACIONADOS COM ESTADO:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais'
  AND (column_name LIKE '%estado%' 
       OR column_name LIKE '%status%' 
       OR column_name LIKE '%situacao%'
       OR column_name LIKE '%condicao%')
ORDER BY column_name;

-- 3. VERIFICAR VALORES ÚNICOS DE POSSÍVEIS CAMPOS DE ESTADO
SELECT 
  'VALORES ÚNICOS POSSÍVEIS ESTADOS:' as info,
  DISTINCT estado as valor
FROM animais
WHERE estado IS NOT NULL
LIMIT 10;

-- 4. VERIFICAR SE HÁ TABELA DE ADOTANTES
SELECT 
  'TABELAS RELACIONADAS COM ADOÇÃO:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%adot%' 
       OR table_name LIKE '%responsavel%'
       OR table_name LIKE '%tutor%')
ORDER BY table_name;

-- 5. VERIFICAR RELACIONAMENTOS COM ADOTANTES
SELECT 
  'FOREIGN KEYS RELACIONADAS:' as info,
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
  AND tc.table_name = 'animais'
  AND (kcu.column_name LIKE '%adot%' 
       OR kcu.column_name LIKE '%responsavel%'
       OR kcu.column_name LIKE '%tutor%');