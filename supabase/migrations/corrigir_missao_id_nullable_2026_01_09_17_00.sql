-- CORRIGIR CONSTRAINT MISSAO_ID PARA PERMITIR NULL
-- Nem todos os movimentos financeiros estão relacionados com missões

-- 1. ALTERAR COLUNA MISSAO_ID PARA PERMITIR NULL
DO $$
BEGIN
  -- Verificar se a coluna existe e é NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
      AND column_name = 'missao_id'
      AND is_nullable = 'NO'
  ) THEN
    -- Alterar para permitir NULL
    ALTER TABLE movimentos_financeiros_2025_12_29_07_00 
    ALTER COLUMN missao_id DROP NOT NULL;
    
    RAISE NOTICE 'Coluna missao_id alterada para permitir NULL';
  ELSE
    RAISE NOTICE 'Coluna missao_id já permite NULL ou não existe';
  END IF;
END $$;

-- 2. VERIFICAR SE A ALTERAÇÃO FOI APLICADA
SELECT 
  'MISSAO_ID APÓS ALTERAÇÃO:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
  AND column_name = 'missao_id';

-- 3. TESTAR INSERÇÃO SEM MISSAO_ID
DO $$
DECLARE
  test_animal_id UUID;
BEGIN
  -- Buscar um animal para teste
  SELECT id INTO test_animal_id 
  FROM animais 
  LIMIT 1;
  
  IF test_animal_id IS NOT NULL THEN
    -- Tentar inserir movimento sem missao_id
    INSERT INTO movimentos_financeiros_2025_12_29_07_00 (
      numero_movimento,
      escopo,
      tipo,
      descricao,
      valor,
      data_movimento,
      animal_id
      -- missao_id omitido intencionalmente
    ) VALUES (
      'TEST-NO-MISSAO-' || EXTRACT(EPOCH FROM NOW())::TEXT,
      'animal',
      'receita',
      'Teste sem missao_id',
      25.00,
      CURRENT_DATE,
      test_animal_id
    );
    
    RAISE NOTICE 'Inserção sem missao_id bem-sucedida';
    
    -- Limpar teste
    DELETE FROM movimentos_financeiros_2025_12_29_07_00 
    WHERE descricao = 'Teste sem missao_id';
    
  ELSE
    RAISE NOTICE 'Nenhum animal encontrado para teste';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro no teste: % %', SQLSTATE, SQLERRM;
END $$;

-- 4. VERIFICAR ESTRUTURA FINAL
SELECT 
  'ESTRUTURA FINAL MISSAO_ID:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
  AND column_name IN ('missao_id', 'animal_id', 'categoria_id')
ORDER BY column_name;