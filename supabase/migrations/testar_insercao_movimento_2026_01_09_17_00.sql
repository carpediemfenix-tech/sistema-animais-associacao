-- TESTAR INSERÇÃO DE MOVIMENTO FINANCEIRO
-- Verificar se todas as colunas funcionam corretamente

-- 1. BUSCAR UM ANIMAL PARA TESTE
SELECT 
  'ANIMAL PARA TESTE:' as info,
  id,
  nome,
  especie
FROM animais
WHERE nome NOT LIKE '%Teste%' 
  AND nome NOT LIKE '%teste%' 
  AND nome NOT LIKE '%Exemplo%'
LIMIT 1;

-- 2. TESTAR INSERÇÃO COM DADOS SIMILARES AO FRONTEND
DO $$
DECLARE
  test_animal_id UUID;
BEGIN
  -- Buscar um animal para teste
  SELECT id INTO test_animal_id 
  FROM animais 
  WHERE nome NOT LIKE '%Teste%' 
    AND nome NOT LIKE '%teste%' 
    AND nome NOT LIKE '%Exemplo%'
  LIMIT 1;
  
  IF test_animal_id IS NOT NULL THEN
    -- Tentar inserir movimento de teste
    INSERT INTO movimentos_financeiros_2025_12_29_07_00 (
      numero_movimento,
      escopo,
      categoria_id,
      tipo,
      descricao,
      valor,
      data_movimento,
      observacoes,
      animal_id
    ) VALUES (
      'MOV-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
      'animal',
      NULL, -- categoria_id pode ser null
      'receita',
      'Teste de inserção - movimento financeiro',
      100.50,
      CURRENT_DATE,
      'Movimento de teste para verificar funcionamento',
      test_animal_id
    );
    
    RAISE NOTICE 'Inserção de teste realizada com sucesso para animal %', test_animal_id;
  ELSE
    RAISE NOTICE 'Nenhum animal encontrado para teste';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro na inserção de teste: % %', SQLSTATE, SQLERRM;
END $$;

-- 3. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT 
  'MOVIMENTO DE TESTE INSERIDO:' as info,
  numero_movimento,
  escopo,
  tipo,
  descricao,
  valor,
  data_movimento,
  animal_id
FROM movimentos_financeiros_2025_12_29_07_00
WHERE descricao LIKE '%Teste de inserção%'
ORDER BY created_at DESC
LIMIT 1;

-- 4. LIMPAR DADOS DE TESTE
DELETE FROM movimentos_financeiros_2025_12_29_07_00 
WHERE descricao LIKE '%Teste de inserção%';

-- 5. VERIFICAR TOTAL DE REGISTOS NA TABELA
SELECT 
  'TOTAL DE MOVIMENTOS:' as info,
  COUNT(*) as total_movimentos
FROM movimentos_financeiros_2025_12_29_07_00;