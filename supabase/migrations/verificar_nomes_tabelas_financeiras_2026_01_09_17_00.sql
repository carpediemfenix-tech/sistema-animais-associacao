-- VERIFICAR NOMES CORRETOS DAS TABELAS FINANCEIRAS
-- Encontrar os nomes reais das tabelas

-- 1. BUSCAR TODAS AS TABELAS COM NOMES SIMILARES
SELECT 
  'TABELAS ENCONTRADAS:' as info,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%financeiro%' 
    OR table_name LIKE '%movimento%'
    OR table_name LIKE '%categoria%'
    OR table_name LIKE '%conta%'
  )
ORDER BY table_name;

-- 2. VERIFICAR SE EXISTEM TABELAS SEM TIMESTAMP
SELECT 
  'TABELAS SEM TIMESTAMP:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'movimentos_financeiros',
    'categorias_financeiras', 
    'contas_financeiras'
  );

-- 3. VERIFICAR ESTRUTURA DE QUALQUER TABELA DE MOVIMENTOS QUE EXISTA
SELECT 
  'PRIMEIRA TABELA MOVIMENTOS ENCONTRADA:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name LIKE '%movimento%financeiro%'
  LIMIT 1
)
ORDER BY ordinal_position;

-- 4. TESTAR INSERÇÃO NA TABELA ATUAL
DO $$
DECLARE
  test_animal_id UUID;
  table_exists BOOLEAN;
BEGIN
  -- Verificar se a tabela existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'movimentos_financeiros_2025_12_29_07_00'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Buscar um animal para teste
    SELECT id INTO test_animal_id 
    FROM animais 
    LIMIT 1;
    
    IF test_animal_id IS NOT NULL THEN
      -- Tentar inserir movimento de teste
      INSERT INTO movimentos_financeiros_2025_12_29_07_00 (
        numero_movimento,
        escopo,
        tipo,
        descricao,
        valor,
        data_movimento,
        animal_id
      ) VALUES (
        'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'animal',
        'receita',
        'Teste de funcionamento',
        50.00,
        CURRENT_DATE,
        test_animal_id
      );
      
      RAISE NOTICE 'Inserção de teste bem-sucedida';
      
      -- Limpar teste
      DELETE FROM movimentos_financeiros_2025_12_29_07_00 
      WHERE descricao = 'Teste de funcionamento';
      
    ELSE
      RAISE NOTICE 'Nenhum animal encontrado para teste';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela movimentos_financeiros_2025_12_29_07_00 não existe';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro no teste: % %', SQLSTATE, SQLERRM;
END $$;