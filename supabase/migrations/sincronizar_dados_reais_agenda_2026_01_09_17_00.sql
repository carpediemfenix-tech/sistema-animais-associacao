-- SINCRONIZAR DADOS REAIS EXISTENTES COM A AGENDA
-- Criar eventos na agenda para dados reais que já existem no sistema

-- 1. CRIAR EVENTOS DE ENTRADA PARA ANIMAIS REAIS (que não têm eventos na agenda)
INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
  titulo,
  descricao,
  tipo_evento,
  categoria,
  data_evento,
  hora_evento,
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
  '10:00:00' as hora_evento,
  'media' as prioridade,
  'concluido' as status,
  a.id as animal_id,
  'Evento criado automaticamente a partir de dados reais existentes' as observacoes,
  jsonb_build_object(
    'origem', 'dados_reais',
    'animal_especie', a.especie,
    'animal_sexo', a.sexo,
    'animal_estado', a.estado,
    'sincronizado_em', NOW()
  ) as metadados
FROM animais a
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.animal_id = a.id AND ae.tipo_evento = 'entrada'
WHERE ae.id IS NULL  -- Apenas animais que não têm evento de entrada
  AND a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
  AND a.data_entrada IS NOT NULL;

-- 2. CRIAR EVENTOS PARA INTERVENÇÕES REAIS
INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
  titulo,
  descricao,
  tipo_evento,
  categoria,
  data_evento,
  hora_evento,
  prioridade,
  status,
  animal_id,
  voluntario_id,
  observacoes,
  metadados
)
SELECT 
  'Intervenção: ' || COALESCE(a.nome, 'Animal') as titulo,
  'Intervenção médica' || 
  CASE WHEN i.veterinario IS NOT NULL THEN ' - Dr. ' || i.veterinario ELSE '' END ||
  CASE WHEN i.custo_final IS NOT NULL THEN ' (€' || i.custo_final || ')' ELSE '' END as descricao,
  'intervencao' as tipo_evento,
  CASE 
    WHEN i.data_intervencao > CURRENT_DATE THEN 'ativo'
    ELSE 'memorial'
  END as categoria,
  i.data_intervencao as data_evento,
  COALESCE(i.hora_intervencao, '14:00:00') as hora_evento,
  CASE 
    WHEN i.urgente = true THEN 'alta'
    ELSE 'media'
  END as prioridade,
  CASE 
    WHEN i.concluida = true THEN 'concluido'
    WHEN i.data_intervencao > CURRENT_DATE THEN 'agendado'
    ELSE 'em_andamento'
  END as status,
  i.animal_id,
  i.voluntario_id,
  'Evento criado automaticamente a partir de dados reais existentes' as observacoes,
  jsonb_build_object(
    'origem', 'dados_reais',
    'intervencao_id', i.id,
    'veterinario', i.veterinario,
    'custo_final', i.custo_final,
    'urgente', i.urgente,
    'concluida', i.concluida,
    'sincronizado_em', NOW()
  ) as metadados
FROM intervencoes i
JOIN animais a ON i.animal_id = a.id
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.metadados->>'intervencao_id' = i.id::text
WHERE ae.id IS NULL  -- Apenas intervenções que não têm evento na agenda
  AND a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
  AND i.data_intervencao IS NOT NULL
LIMIT 50; -- Limitar para não sobrecarregar

-- 3. VERIFICAR QUANTOS EVENTOS FORAM CRIADOS
SELECT 
  'EVENTOS CRIADOS PARA DADOS REAIS:' as info,
  COUNT(*) as total_eventos_reais,
  tipo_evento,
  COUNT(*) as por_tipo
FROM agenda_eventos_unificada_2026_01_09_09_00
WHERE observacoes LIKE '%dados reais existentes%'
GROUP BY tipo_evento;

-- 4. VERIFICAR TOTAL DE EVENTOS NA AGENDA AGORA
SELECT 
  'TOTAL EVENTOS NA AGENDA:' as info,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN observacoes LIKE '%dados reais existentes%' THEN 1 END) as eventos_dados_reais,
  COUNT(CASE WHEN observacoes LIKE '%exemplo%' OR titulo LIKE '%Exemplo%' THEN 1 END) as eventos_exemplo
FROM agenda_eventos_unificada_2026_01_09_09_00;