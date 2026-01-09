-- ADICIONAR COLUNA ANIMAL_ID À TABELA MOVIMENTOS FINANCEIROS - VERSÃO CORRIGIDA

-- 1. ADICIONAR COLUNA ANIMAL_ID SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
    AND column_name = 'animal_id'
  ) THEN
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ADD COLUMN animal_id UUID REFERENCES animais(id);
    
    RAISE NOTICE 'Coluna animal_id adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna animal_id já existe';
  END IF;
END $$;

-- 2. VERIFICAR SE A COLUNA FOI ADICIONADA
SELECT 
  'COLUNA ANIMAL_ID APÓS ALTERAÇÃO:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00' 
AND column_name = 'animal_id';

-- 3. VERIFICAR ESTRUTURA COMPLETA ATUALIZADA
SELECT 
  'ESTRUTURA COMPLETA ATUALIZADA:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
ORDER BY ordinal_position;

-- 4. TESTAR INSERT COM ANIMAL_ID
-- Verificar se há animais disponíveis
SELECT 
  'ANIMAIS DISPONÍVEIS PARA TESTE:' as info,
  id,
  nome,
  especie
FROM animais
LIMIT 3;

-- 5. VERIFICAR TABELAS DE CATEGORIAS FINANCEIRAS EXISTENTES
SELECT 
  'TABELAS CATEGORIAS FINANCEIRAS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_name LIKE '%categorias_financeiras%'
ORDER BY table_name;