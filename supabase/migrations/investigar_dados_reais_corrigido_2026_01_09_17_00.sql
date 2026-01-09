-- INVESTIGAR DADOS REAIS EXISTENTES NO SISTEMA - VERSÃO CORRIGIDA
-- Primeiro verificar que tabelas existem

-- 1. LISTAR TODAS AS TABELAS PRINCIPAIS
SELECT 
  'TABELAS PRINCIPAIS:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('animais', 'intervencoes', 'voluntarios', 'agenda_eventos_unificada_2026_01_09_09_00')
ORDER BY table_name;

-- 2. VERIFICAR ANIMAIS REAIS NO SISTEMA
SELECT 
  'ANIMAIS REAIS NO SISTEMA:' as info,
  COUNT(*) as total_animais,
  COUNT(CASE WHEN nome NOT LIKE '%Teste%' AND nome NOT LIKE '%teste%' AND nome NOT LIKE '%Exemplo%' THEN 1 END) as animais_reais,
  COUNT(CASE WHEN nome LIKE '%Teste%' OR nome LIKE '%teste%' OR nome LIKE '%Exemplo%' THEN 1 END) as animais_teste,
  MIN(data_entrada) as primeiro_animal,
  MAX(data_entrada) as ultimo_animal
FROM animais;

-- 3. MOSTRAR ALGUNS ANIMAIS REAIS (NÃO TESTE)
SELECT 
  'EXEMPLOS ANIMAIS REAIS:' as info,
  nome,
  especie,
  data_entrada,
  estado
FROM animais
WHERE nome NOT LIKE '%Teste%' 
  AND nome NOT LIKE '%teste%' 
  AND nome NOT LIKE '%Exemplo%'
  AND nome NOT LIKE '%Demo%'
ORDER BY data_entrada DESC
LIMIT 5;

-- 4. VERIFICAR INTERVENÇÕES REAIS
SELECT 
  'INTERVENÇÕES REAIS:' as info,
  COUNT(*) as total_intervencoes,
  COUNT(CASE WHEN observacoes IS NULL OR (observacoes NOT LIKE '%teste%' AND observacoes NOT LIKE '%exemplo%') THEN 1 END) as intervencoes_reais,
  MIN(data_intervencao) as primeira_intervencao,
  MAX(data_intervencao) as ultima_intervencao
FROM intervencoes;

-- 5. MOSTRAR ALGUMAS INTERVENÇÕES REAIS
SELECT 
  'EXEMPLOS INTERVENÇÕES REAIS:' as info,
  i.id,
  i.data_intervencao,
  a.nome as animal_nome,
  i.veterinario,
  i.custo_final
FROM intervencoes i
JOIN animais a ON i.animal_id = a.id
WHERE (i.observacoes IS NULL OR (i.observacoes NOT LIKE '%teste%' AND i.observacoes NOT LIKE '%exemplo%'))
  AND a.nome NOT LIKE '%Teste%'
ORDER BY i.data_intervencao DESC
LIMIT 5;

-- 6. VERIFICAR VOLUNTÁRIOS REAIS
SELECT 
  'VOLUNTÁRIOS REAIS:' as info,
  COUNT(*) as total_voluntarios,
  COUNT(CASE WHEN nome NOT LIKE '%Teste%' AND nome NOT LIKE '%teste%' THEN 1 END) as voluntarios_reais
FROM voluntarios;

-- 7. VERIFICAR EVENTOS NA AGENDA
SELECT 
  'EVENTOS NA AGENDA:' as info,
  COUNT(*) as total_eventos_agenda,
  COUNT(CASE WHEN titulo LIKE '%Teste%' OR titulo LIKE '%teste%' OR titulo LIKE '%Exemplo%' THEN 1 END) as eventos_teste,
  COUNT(CASE WHEN titulo NOT LIKE '%Teste%' AND titulo NOT LIKE '%teste%' AND titulo NOT LIKE '%Exemplo%' THEN 1 END) as eventos_possiveis_reais,
  tipo_evento,
  COUNT(*) as por_tipo
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY tipo_evento;

-- 8. VERIFICAR SINCRONIZAÇÃO ANIMAIS -> AGENDA
SELECT 
  'SINCRONIZAÇÃO ANIMAIS -> AGENDA:' as info,
  a.nome as animal_nome,
  a.data_entrada,
  ae.titulo as evento_agenda,
  ae.data_evento,
  CASE 
    WHEN ae.id IS NOT NULL THEN 'SINCRONIZADO'
    ELSE 'NÃO_SINCRONIZADO'
  END as status_sincronizacao
FROM animais a
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.animal_id = a.id 
  AND ae.tipo_evento = 'entrada'
WHERE a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
ORDER BY a.data_entrada DESC
LIMIT 10;

-- 9. VERIFICAR SINCRONIZAÇÃO INTERVENÇÕES -> AGENDA
SELECT 
  'SINCRONIZAÇÃO INTERVENÇÕES -> AGENDA:' as info,
  i.id as intervencao_id,
  i.data_intervencao,
  a.nome as animal_nome,
  ae.titulo as evento_agenda,
  CASE 
    WHEN ae.id IS NOT NULL THEN 'SINCRONIZADO'
    ELSE 'NÃO_SINCRONIZADO'
  END as status_sincronizacao
FROM intervencoes i
JOIN animais a ON i.animal_id = a.id
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.referencia_id = i.id::text 
  AND ae.tipo_evento = 'intervencao'
WHERE (i.observacoes IS NULL OR (i.observacoes NOT LIKE '%teste%' AND i.observacoes NOT LIKE '%exemplo%'))
  AND a.nome NOT LIKE '%Teste%'
ORDER BY i.data_intervencao DESC
LIMIT 10;