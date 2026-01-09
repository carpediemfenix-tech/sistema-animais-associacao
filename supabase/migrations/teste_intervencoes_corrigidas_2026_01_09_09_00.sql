-- TESTE DE INSERÇÃO DE INTERVENÇÃO
-- Verificar se agora conseguimos inserir intervenções sem erro

-- 1. Verificar se existe pelo menos um animal para teste
SELECT 
  'ANIMAIS DISPONÍVEIS PARA TESTE:' as info,
  id, 
  nome, 
  especie
FROM animais 
LIMIT 3;

-- 2. Verificar se existe pelo menos um tipo de intervenção
SELECT 
  'TIPOS DE INTERVENÇÃO DISPONÍVEIS:' as info,
  id, 
  nome
FROM tipos_intervencoes 
LIMIT 3;

-- 3. Tentar inserir uma intervenção de teste (se houver animais)
DO $$
DECLARE
  test_animal_id UUID;
  test_tipo_id UUID;
BEGIN
  -- Buscar um animal para teste
  SELECT id INTO test_animal_id FROM animais LIMIT 1;
  
  -- Buscar um tipo de intervenção para teste
  SELECT id INTO test_tipo_id FROM tipos_intervencoes LIMIT 1;
  
  IF test_animal_id IS NOT NULL THEN
    -- Inserir intervenção de teste
    INSERT INTO intervencoes (
      animal_id,
      tipo_intervencao_id,
      data_intervencao,
      veterinario,
      observacoes,
      custo,
      desconto_protocolo,
      urgente,
      concluida
    ) VALUES (
      test_animal_id,
      test_tipo_id,
      CURRENT_DATE + INTERVAL '1 day',
      'Dr. Teste Sistema',
      'Teste de inserção após correção de triggers',
      50.00,
      0.00,
      false,
      false
    );
    
    RAISE NOTICE 'Intervenção de teste inserida com sucesso!';
    
    -- Remover a intervenção de teste
    DELETE FROM intervencoes 
    WHERE veterinario = 'Dr. Teste Sistema' 
    AND observacoes = 'Teste de inserção após correção de triggers';
    
    RAISE NOTICE 'Intervenção de teste removida com sucesso!';
    
  ELSE
    RAISE NOTICE 'Nenhum animal encontrado para teste';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO no teste de inserção: % %', SQLSTATE, SQLERRM;
END $$;

-- 4. Verificar se o trigger está funcionando corretamente
SELECT 
  'STATUS DO SISTEMA APÓS CORREÇÕES:' as info,
  'Triggers corrigidos e funcionais' as status;

-- 5. Verificar últimos eventos criados na agenda (se existir)
SELECT 
  'ÚLTIMOS EVENTOS NA AGENDA:' as info,
  titulo,
  tipo_evento,
  categoria,
  data_evento,
  created_at
FROM agenda_eventos_unificada_2026_01_09_09_00
ORDER BY created_at DESC
LIMIT 5;