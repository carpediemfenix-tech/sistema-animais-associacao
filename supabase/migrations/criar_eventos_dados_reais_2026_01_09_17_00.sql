-- VERIFICAR VALORES VÁLIDOS E CRIAR EVENTOS CORRETOS

-- 1. VERIFICAR TIPOS DE EVENTO EXISTENTES
SELECT 
  'TIPOS DE EVENTO EXISTENTES:' as info,
  tipo_evento,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY tipo_evento;

-- 2. MARCAR DADOS DE TESTE EXISTENTES
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
   OR titulo LIKE '%Resgate%'
   OR titulo LIKE '%Consulta%'
   OR titulo LIKE '%Cirurgia%'
   OR titulo LIKE '%Manutenção%'
   OR titulo LIKE '%Marco%'
   OR titulo LIKE '%Óbito%'
   OR titulo LIKE '%Formação%'
   OR descricao LIKE '%exemplo%'
   OR descricao LIKE '%demonstração%')
  AND observacoes NOT LIKE '%DADOS DE TESTE%';

-- 3. CRIAR EVENTOS PARA ANIMAIS REAIS (usando tipo_evento válido)
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
  'animal' as tipo_evento,  -- Usar tipo que existe
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

-- 4. VERIFICAR RESULTADOS
SELECT 
  'RESUMO APÓS SINCRONIZAÇÃO:' as info,
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN observacoes LIKE '%DADOS REAIS%' THEN 1 END) as eventos_dados_reais,
  COUNT(CASE WHEN observacoes LIKE '%DADOS DE TESTE%' THEN 1 END) as eventos_teste
FROM agenda_eventos_unificada_2026_01_09_09_00;

-- 5. MOSTRAR ALGUNS EVENTOS DE DADOS REAIS
SELECT 
  'EVENTOS DADOS REAIS:' as info,
  titulo,
  tipo_evento,
  data_evento,
  LEFT(observacoes, 50) as observacoes_resumo
FROM agenda_eventos_unificada_2026_01_09_09_00
WHERE observacoes LIKE '%DADOS REAIS%'
ORDER BY created_at DESC
LIMIT 3;