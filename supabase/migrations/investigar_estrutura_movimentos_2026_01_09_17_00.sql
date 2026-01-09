-- INVESTIGAR ESTRUTURA DA TABELA MOVIMENTOS FINANCEIROS
-- Verificar se a coluna animal_id existe

-- 1. VERIFICAR ESTRUTURA COMPLETA DA TABELA
SELECT 
  'ESTRUTURA MOVIMENTOS FINANCEIROS:' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE A COLUNA ANIMAL_ID EXISTE
SELECT 
  'COLUNA ANIMAL_ID:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
      AND column_name = 'animal_id'
    ) 
    THEN 'EXISTS' 
    ELSE 'NOT_EXISTS' 
  END as status;

-- 3. VERIFICAR TODAS AS TABELAS DE MOVIMENTOS FINANCEIROS
SELECT 
  'TABELAS MOVIMENTOS FINANCEIROS:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%movimentos_financeiros%'
ORDER BY table_name;

-- 4. VERIFICAR DADOS EXISTENTES NA TABELA
SELECT 
  'DADOS EXISTENTES:' as info,
  COUNT(*) as total_registos
FROM movimentos_financeiros_2025_12_29_07_00;

-- 5. MOSTRAR ALGUNS REGISTOS PARA VER ESTRUTURA
SELECT 
  'EXEMPLO DE DADOS:' as info,
  *
FROM movimentos_financeiros_2025_12_29_07_00
LIMIT 3;