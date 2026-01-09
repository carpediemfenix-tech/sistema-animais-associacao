-- SINCRONIZAR DADOS REAIS COM SINTAXE CORRIGIDA

-- 1. VERIFICAR VALORES PRIORIDADE EXISTENTES
SELECT 
  'VALORES PRIORIDADE:' as info,
  prioridade,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY prioridade;

-- 2. VERIFICAR VALORES STATUS EXISTENTES
SELECT 
  'VALORES STATUS:' as info,
  status,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY status;

-- 3. MARCAR DADOS DE TESTE EXISTENTES PRIMEIRO
UPDATE agenda_eventos_unificada_2026_01_09_09_00 
SET 
  observacoes = '🧪 DADOS DE TESTE - ' || COALESCE(observacoes, 'Dados de exemplo para demonstração'),
  metadados = COALESCE(metadados, '{}'::jsonb) || jsonb_build_object('tipo_dados', 'teste', 'marcado_em', NOW())
WHERE (titulo LIKE '%Luna%' 
   OR titulo LIKE '%Max%' 
   OR titulo LIKE '%Bella%'
   OR titulo LIKE '%Rex%'
   OR titulo LIKE '%Thor%'
   OR titulo LIKE '%Mimi%'
   OR titulo LIKE '%Workshop%'
   OR titulo LIKE '%Feira%'
   OR descricao LIKE '%exemplo%'
   OR descricao LIKE '%demonstração%')
  AND observacoes NOT LIKE '%DADOS DE TESTE%';

-- 4. VERIFICAR ANIMAIS REAIS DISPONÍVEIS
SELECT 
  'ANIMAIS REAIS DISPONÍVEIS:' as info,
  COUNT(*) as total_animais_reais
FROM animais a
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.animal_id = a.id AND ae.tipo_evento = 'entrada'
WHERE ae.id IS NULL  -- Sem evento de entrada
  AND a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
  AND a.nome NOT LIKE '%Luna%'
  AND a.nome NOT LIKE '%Max%'
  AND a.nome NOT LIKE '%Bella%'
  AND a.nome NOT LIKE '%Rex%'
  AND a.data_entrada IS NOT NULL;

-- 5. CRIAR EVENTOS PARA ANIMAIS REAIS (usando valores que funcionam)
INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
  titulo,
  descricao,
  tipo_evento,
  categoria,
  data_evento,
  prioridade,
  status,
  animal_id,
  observacoes,
  metadados
)
SELECT 
  'Entrada: ' || a.nome as titulo,
  'Animal admitido na associação - ' || a.especie || 
  CASE WHEN a.sexo IS NOT NULL THEN ', ' || a.sexo ELSE '' END as descricao,
  'entrada' as tipo_evento,
  'memorial' as categoria,
  a.data_entrada as data_evento,
  'normal' as prioridade,
  'concluido' as status,
  a.id as animal_id,
  '🔄 DADOS REAIS - Evento criado automaticamente a partir de dados reais existentes' as observacoes,
  jsonb_build_object(
    'origem', 'dados_reais',
    'tipo_dados', 'real',
    'animal_especie', a.especie,
    'animal_sexo', a.sexo,
    'sincronizado_em', NOW()
  ) as metadados
FROM animais a
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.animal_id = a.id AND ae.tipo_evento = 'entrada'
WHERE ae.id IS NULL
  AND a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
  AND a.nome NOT LIKE '%Luna%'
  AND a.nome NOT LIKE '%Max%'
  AND a.nome NOT LIKE '%Bella%'
  AND a.nome NOT LIKE '%Rex%'
  AND a.data_entrada IS NOT NULL
LIMIT 5;

-- 6. VERIFICAR RESULTADOS FINAIS
SELECT 
  'RESUMO FINAL:' as info,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN observacoes LIKE '%DADOS REAIS%' THEN 1 END) as eventos_dados_reais,
  COUNT(CASE WHEN observacoes LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_teste,
  COUNT(CASE WHEN observacoes NOT LIKE '%DADOS REAIS%' AND observacoes NOT LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_sem_marcacao
FROM agenda_eventos_unificada_2026_01_09_09_00;