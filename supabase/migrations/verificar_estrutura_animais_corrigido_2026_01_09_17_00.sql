-- VERIFICAR ESTRUTURA DA TABELA ANIMAIS - CORRIGIDO

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

-- 3. VERIFICAR VALORES DE POSSÍVEIS CAMPOS DE ESTADO
SELECT 
  'VALORES ESTADO EXISTENTES:' as info,
  estado as valor,
  COUNT(*) as quantidade
FROM animais
WHERE estado IS NOT NULL
GROUP BY estado
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