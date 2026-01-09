-- SINCRONIZAR DADOS REAIS EXISTENTES COM A AGENDA - VERSÃO CORRIGIDA
-- Usar apenas campos que existem na tabela

-- 1. CRIAR EVENTOS DE ENTRADA PARA ANIMAIS REAIS
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
  'media' as prioridade,
  'concluido' as status,
  a.id as animal_id,
  '🔄 DADOS REAIS - Evento criado automaticamente a partir de dados reais existentes' as observacoes,
  jsonb_build_object(
    'origem', 'dados_reais',
    'tipo_dados', 'real',
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
  AND a.data_entrada IS NOT NULL
LIMIT 20; -- Limitar para não sobrecarregar

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
  '🔄 DADOS REAIS - Evento criado automaticamente a partir de dados reais existentes' as observacoes,
  jsonb_build_object(
    'origem', 'dados_reais',
    'tipo_dados', 'real',
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
LIMIT 20; -- Limitar para não sobrecarregar

-- 3. MARCAR DADOS DE TESTE EXISTENTES
UPDATE agenda_eventos_unificada_2026_01_09_09_00 
SET 
  observacoes = '🧪 DADOS DE TESTE - ' || COALESCE(observacoes, 'Dados de exemplo para demonstração'),
  metadados = COALESCE(metadados, '{}'::jsonb) || jsonb_build_object('tipo_dados', 'teste', 'marcado_em', NOW())
WHERE (titulo LIKE '%Teste%' 
   OR titulo LIKE '%teste%' 
   OR titulo LIKE '%Exemplo%'
   OR titulo LIKE '%Demo%'
   OR descricao LIKE '%exemplo%'
   OR descricao LIKE '%demonstração%')
  AND observacoes NOT LIKE '%DADOS DE TESTE%';

-- 4. VERIFICAR RESULTADOS
SELECT 
  'RESUMO EVENTOS NA AGENDA:' as info,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN observacoes LIKE '%DADOS REAIS%' THEN 1 END) as eventos_dados_reais,
  COUNT(CASE WHEN observacoes LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_teste,
  COUNT(CASE WHEN observacoes NOT LIKE '%DADOS REAIS%' AND observacoes NOT LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_sem_marcacao
FROM agenda_eventos_unificada_2026_01_09_09_00;

-- 5. MOSTRAR ALGUNS EVENTOS DE DADOS REAIS CRIADOS
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