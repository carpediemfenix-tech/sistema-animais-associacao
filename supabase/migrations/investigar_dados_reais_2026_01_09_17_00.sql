-- INVESTIGAR DADOS REAIS EXISTENTES NO SISTEMA
-- Verificar que dados reais existem e por que não aparecem na agenda

-- 1. VERIFICAR ANIMAIS REAIS NO SISTEMA
SELECT 
  'ANIMAIS REAIS NO SISTEMA:' as info,
  COUNT(*) as total_animais,
  COUNT(CASE WHEN nome NOT LIKE '%Teste%' AND nome NOT LIKE '%teste%' AND nome NOT LIKE '%Exemplo%' THEN 1 END) as animais_reais,
  COUNT(CASE WHEN nome LIKE '%Teste%' OR nome LIKE '%teste%' OR nome LIKE '%Exemplo%' THEN 1 END) as animais_teste
FROM animais;

-- 2. VERIFICAR INTERVENÇÕES REAIS
SELECT 
  'INTERVENÇÕES REAIS:' as info,
  COUNT(*) as total_intervencoes,
  COUNT(CASE WHEN observacoes NOT LIKE '%teste%' AND observacoes NOT LIKE '%exemplo%' THEN 1 END) as intervencoes_reais,
  MIN(data_intervencao) as primeira_intervencao,
  MAX(data_intervencao) as ultima_intervencao
FROM intervencoes;

-- 3. VERIFICAR MISSÕES REAIS
SELECT 
  'MISSÕES REAIS:' as info,
  COUNT(*) as total_missoes,
  MIN(data_inicio) as primeira_missao,
  MAX(data_inicio) as ultima_missao
FROM missoes;

-- 4. VERIFICAR VOLUNTÁRIOS REAIS
SELECT 
  'VOLUNTÁRIOS REAIS:' as info,
  COUNT(*) as total_voluntarios,
  COUNT(CASE WHEN nome NOT LIKE '%Teste%' AND nome NOT LIKE '%teste%' THEN 1 END) as voluntarios_reais
FROM voluntarios;

-- 5. VERIFICAR EVENTOS NA AGENDA (COMPARAR COM DADOS REAIS)
SELECT 
  'EVENTOS NA AGENDA:' as info,
  COUNT(*) as total_eventos_agenda,
  COUNT(CASE WHEN titulo LIKE '%Teste%' OR titulo LIKE '%teste%' OR titulo LIKE '%Exemplo%' THEN 1 END) as eventos_teste,
  COUNT(CASE WHEN titulo NOT LIKE '%Teste%' AND titulo NOT LIKE '%teste%' AND titulo NOT LIKE '%Exemplo%' THEN 1 END) as eventos_possiveis_reais
FROM agenda_eventos_unificada_2026_01_09_09_00;

-- 6. VERIFICAR SE TRIGGERS ESTÃO FUNCIONANDO
-- Verificar se há eventos na agenda correspondentes a animais reais
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
ORDER BY a.data_entrada DESC
LIMIT 10;

-- 7. VERIFICAR SINCRONIZAÇÃO DE INTERVENÇÕES
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
WHERE i.observacoes NOT LIKE '%teste%'
  AND i.observacoes NOT LIKE '%exemplo%'
ORDER BY i.data_intervencao DESC
LIMIT 10;

-- 8. VERIFICAR SINCRONIZAÇÃO DE MISSÕES
SELECT 
  'SINCRONIZAÇÃO MISSÕES -> AGENDA:' as info,
  m.id as missao_id,
  m.titulo as missao_titulo,
  m.data_inicio,
  ae.titulo as evento_agenda,
  CASE 
    WHEN ae.id IS NOT NULL THEN 'SINCRONIZADO'
    ELSE 'NÃO_SINCRONIZADO'
  END as status_sincronizacao
FROM missoes m
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae 
  ON ae.referencia_id = m.id::text 
  AND ae.tipo_evento = 'missao'
ORDER BY m.data_inicio DESC
LIMIT 10;