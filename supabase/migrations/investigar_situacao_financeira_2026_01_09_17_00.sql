-- INVESTIGAR O QUE ACONTECEU COM AS TABELAS FINANCEIRAS
-- Descobrir por que a tabela antiga não existe mais

-- 1. VERIFICAR TODAS AS TABELAS RELACIONADAS COM FINANCEIRO
SELECT 
  'TODAS AS TABELAS FINANCEIRAS:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%financeiro%' 
   OR table_name LIKE '%movimento%'
   OR table_name LIKE '%categoria%'
   OR table_name LIKE '%conta%'
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA NOVA ATUAL
SELECT 
  'ESTRUTURA ATUAL:' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE HÁ DADOS NA TABELA ATUAL
SELECT 
  'DADOS ATUAIS:' as info,
  COUNT(*) as total_registos
FROM movimentos_financeiros_2025_12_29_07_00;

-- 4. VERIFICAR TABELAS DE CATEGORIAS FINANCEIRAS
SELECT 
  'TABELAS CATEGORIAS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_name LIKE '%categorias_financeiras%'
ORDER BY table_name;

-- 5. VERIFICAR TABELAS DE CONTAS FINANCEIRAS
SELECT 
  'TABELAS CONTAS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_name LIKE '%contas_financeiras%'
ORDER BY table_name;

-- 6. TESTAR SE PODEMOS INSERIR UM MOVIMENTO SIMPLES
-- Primeiro verificar se há animais disponíveis
SELECT 
  'ANIMAIS DISPONÍVEIS:' as info,
  id,
  nome,
  especie
FROM animais
LIMIT 3;