-- VERIFICAR ESTRUTURA DA TABELA AGENDA E DADOS REAIS

-- 1. VERIFICAR ESTRUTURA DA TABELA AGENDA
SELECT 
  'ESTRUTURA AGENDA:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'agenda_eventos_unificada_2026_01_09_09_00'
ORDER BY ordinal_position;

-- 2. VERIFICAR ANIMAIS REAIS NO SISTEMA
SELECT 
  'ANIMAIS REAIS:' as info,
  COUNT(*) as total_animais,
  COUNT(CASE WHEN nome NOT LIKE '%Teste%' AND nome NOT LIKE '%teste%' AND nome NOT LIKE '%Exemplo%' AND nome NOT LIKE '%Demo%' THEN 1 END) as animais_reais
FROM animais;

-- 3. MOSTRAR ALGUNS ANIMAIS REAIS
SELECT 
  'EXEMPLOS ANIMAIS REAIS:' as info,
  id,
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
  MIN(data_intervencao) as primeira,
  MAX(data_intervencao) as ultima
FROM intervencoes;

-- 5. VERIFICAR EVENTOS NA AGENDA
SELECT 
  'EVENTOS NA AGENDA:' as info,
  COUNT(*) as total_eventos,
  tipo_evento,
  COUNT(*) as por_tipo
FROM agenda_eventos_unificada_2026_01_09_09_00
GROUP BY tipo_evento;

-- 6. VERIFICAR SE HÁ ANIMAIS REAIS SEM EVENTOS NA AGENDA
SELECT 
  'ANIMAIS SEM EVENTOS NA AGENDA:' as info,
  a.id,
  a.nome,
  a.data_entrada,
  CASE 
    WHEN ae.id IS NOT NULL THEN 'TEM_EVENTO'
    ELSE 'SEM_EVENTO'
  END as status_agenda
FROM animais a
LEFT JOIN agenda_eventos_unificada_2026_01_09_09_00 ae ON ae.animal_id = a.id
WHERE a.nome NOT LIKE '%Teste%' 
  AND a.nome NOT LIKE '%teste%' 
  AND a.nome NOT LIKE '%Exemplo%'
  AND a.nome NOT LIKE '%Demo%'
ORDER BY a.data_entrada DESC
LIMIT 10;