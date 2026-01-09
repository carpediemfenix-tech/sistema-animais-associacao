-- CRIAR EVENTOS PARA DADOS REAIS COM TIPOS VÁLIDOS

-- 1. CRIAR EVENTOS PARA ANIMAIS REAIS (usando tipos que funcionam)
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
  'geral' as tipo_evento,  -- Usar tipo que existe (baseado nos resultados anteriores)
  'memorial' as categoria,
  a.data_entrada as data_evento,
  'baixa' as prioridade,   -- Usar prioridade que existe
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
  ON ae.animal_id = a.id AND ae.titulo LIKE 'Entrada: ' || a.nome
WHERE ae.id IS NULL
  AND a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
  AND a.nome NOT LIKE '%Luna%'
  AND a.nome NOT LIKE '%Max%'
  AND a.nome NOT LIKE '%Bella%'
  AND a.nome NOT LIKE '%Rex%'
  AND a.nome NOT LIKE '%Thor%'
  AND a.nome NOT LIKE '%Mimi%'
  AND a.data_entrada IS NOT NULL
LIMIT 3;

-- 2. CRIAR EVENTOS PARA INTERVENÇÕES REAIS
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
  'Intervenção: ' || COALESCE(a.nome, 'Animal') as titulo,
  'Intervenção médica' || 
  CASE WHEN i.veterinario IS NOT NULL THEN ' - Dr. ' || i.veterinario ELSE '' END as descricao,
  'geral' as tipo_evento,
  CASE 
    WHEN i.data_intervencao > CURRENT_DATE THEN 'ativo'
    ELSE 'memorial'
  END as categoria,
  i.data_intervencao as data_evento,
  CASE 
    WHEN i.urgente = true THEN 'alta'
    ELSE 'baixa'
  END as prioridade,
  CASE 
    WHEN i.concluida = true THEN 'concluido'
    WHEN i.data_intervencao > CURRENT_DATE THEN 'agendado'
    ELSE 'em_andamento'
  END as status,
  i.animal_id,
  '🔄 DADOS REAIS - Evento criado automaticamente a partir de dados reais existentes' as observacoes,
  jsonb_build_object(
    'origem', 'dados_reais',
    'tipo_dados', 'real',
    'intervencao_id', i.id,
    'veterinario', i.veterinario,
    'urgente', i.urgente,
    'sincronizado_em', NOW()
  ) as metadados
FROM intervencoes i
JOIN animais a ON i.animal_id = a.id
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.metadados->>'intervencao_id' = i.id::text
WHERE ae.id IS NULL
  AND a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
  AND a.nome NOT LIKE '%Luna%'
  AND a.nome NOT LIKE '%Max%'
  AND a.nome NOT LIKE '%Bella%'
  AND a.nome NOT LIKE '%Rex%'
  AND i.data_intervencao IS NOT NULL
LIMIT 3;

-- 3. VERIFICAR RESULTADOS FINAIS
SELECT 
  'RESUMO FINAL DA AGENDA:' as info,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN observacoes LIKE '%DADOS REAIS%' THEN 1 END) as eventos_dados_reais,
  COUNT(CASE WHEN observacoes LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_teste,
  COUNT(CASE WHEN observacoes NOT LIKE '%DADOS REAIS%' AND observacoes NOT LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_sem_marcacao
FROM agenda_eventos_unificada_2026_01_09_09_00;

-- 4. MOSTRAR EVENTOS DE DADOS REAIS CRIADOS
SELECT 
  'EVENTOS DADOS REAIS CRIADOS:' as info,
  titulo,
  tipo_evento,
  categoria,
  data_evento,
  status
FROM agenda_eventos_unificada_2026_01_09_09_00
WHERE observacoes LIKE '%DADOS REAIS%'
ORDER BY created_at DESC
LIMIT 5;