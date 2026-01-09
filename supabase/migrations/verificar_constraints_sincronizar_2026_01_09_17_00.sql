-- VERIFICAR CONSTRAINTS E SINCRONIZAR DADOS REAIS

-- 1. VERIFICAR CONSTRAINTS DA TABELA AGENDA
SELECT 
  'CONSTRAINTS DA AGENDA:' as info,
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%agenda_eventos_unificada_2026_01_09_09_00%';

-- 2. VERIFICAR VALORES ÚNICOS EXISTENTES PARA PRIORIDADE
SELECT 
  'VALORES PRIORIDADE EXISTENTES:' as info,
  DISTINCT prioridade,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY prioridade;

-- 3. VERIFICAR VALORES ÚNICOS EXISTENTES PARA STATUS
SELECT 
  'VALORES STATUS EXISTENTES:' as info,
  DISTINCT status,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY status;

-- 4. CRIAR EVENTOS DE ENTRADA PARA ANIMAIS REAIS (com valores corretos)
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
  'normal' as prioridade,  -- Usar valor que existe
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
LIMIT 10; -- Começar com poucos

-- 5. MARCAR DADOS DE TESTE EXISTENTES
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

-- 6. VERIFICAR RESULTADOS
SELECT 
  'RESUMO FINAL:' as info,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN observacoes LIKE '%DADOS REAIS%' THEN 1 END) as eventos_dados_reais,
  COUNT(CASE WHEN observacoes LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_teste
FROM agenda_eventos_unificada_2026_01_09_09_00;