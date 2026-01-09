-- ADICIONAR COLUNA ANIMAL_ID À TABELA MOVIMENTOS FINANCEIROS
-- Corrigir estrutura da tabela para suportar movimentos de animais

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
-- Primeiro, verificar se há animais disponíveis
SELECT 
  'ANIMAIS DISPONÍVEIS PARA TESTE:' as info,
  id,
  nome,
  especie
FROM animais
LIMIT 3;

-- 5. VERIFICAR SE EXISTEM CATEGORIAS FINANCEIRAS
SELECT 
  'CATEGORIAS FINANCEIRAS DISPONÍVEIS:' as info,
  id,
  nome,
  tipo,
  escopo
FROM categorias_financeiras_2025_12_29_07_00
WHERE escopo IN ('animal', 'ambos')
AND ativo = true
LIMIT 3;