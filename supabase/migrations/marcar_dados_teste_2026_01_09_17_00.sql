-- MARCAR DADOS DE TESTE E VERIFICAR TIPOS VÁLIDOS

-- 1. VERIFICAR TODOS OS TIPOS DE EVENTO EXISTENTES
SELECT 
  'TIPOS DE EVENTO VÁLIDOS:' as info,
  tipo_evento,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY tipo_evento
ORDER BY tipo_evento;

-- 2. VERIFICAR TODAS AS PRIORIDADES VÁLIDAS
SELECT 
  'PRIORIDADES VÁLIDAS:' as info,
  prioridade,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY prioridade
ORDER BY prioridade;

-- 3. VERIFICAR TODOS OS STATUS VÁLIDOS
SELECT 
  'STATUS VÁLIDOS:' as info,
  status,
  COUNT(*) as quantidade
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY status
ORDER BY status;

-- 4. MARCAR DADOS DE TESTE EXISTENTES
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
   OR titulo LIKE '%Evento de Adoção%'
   OR descricao LIKE '%exemplo%'
   OR descricao LIKE '%demonstração%')
  AND observacoes NOT LIKE '%DADOS DE TESTE%';

-- 5. VERIFICAR QUANTOS DADOS DE TESTE FORAM MARCADOS
SELECT 
  'DADOS DE TESTE MARCADOS:' as info,
  COUNT(*) as total_eventos_teste
FROM agenda_eventos_unificada_2026_01_09_09_00
WHERE observacoes LIKE '%DADOS DE TESTE%';

-- 6. VERIFICAR ANIMAIS REAIS DISPONÍVEIS
SELECT 
  'ANIMAIS REAIS DISPONÍVEIS:' as info,
  a.id,
  a.nome,
  a.especie,
  a.data_entrada
FROM animais a
WHERE a.nome NOT LIKE '%Teste%' 
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
ORDER BY a.data_entrada DESC
LIMIT 5;