-- CORREÇÃO RPC AGENDA - SEM AMBIGUIDADE
-- Remover função problemática e recriar corretamente

-- 1. REMOVER FUNÇÃO PROBLEMÁTICA
DROP FUNCTION IF EXISTS get_agenda_eventos_periodo(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 2. CRIAR FUNÇÃO CORRIGIDA SEM AMBIGUIDADE
CREATE OR REPLACE FUNCTION get_agenda_eventos_periodo(
  p_data_inicio TEXT,
  p_data_fim TEXT,
  p_categoria_filter TEXT DEFAULT NULL,
  p_tipo_filter TEXT DEFAULT NULL,
  p_animal_filter TEXT DEFAULT NULL,
  p_voluntario_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  tipo_evento TEXT,
  categoria TEXT,
  data_evento TIMESTAMP WITH TIME ZONE,
  data_fim_evento TIMESTAMP WITH TIME ZONE,
  animal_id UUID,
  voluntario_id UUID,
  status TEXT,
  prioridade TEXT,
  local TEXT,
  observacoes TEXT,
  metadados JSONB,
  cor_evento TEXT,
  icone_evento TEXT,
  animal_nome TEXT,
  voluntario_nome TEXT
) AS $$
BEGIN
  -- Log dos parâmetros para debug
  RAISE NOTICE 'RPC get_agenda_eventos_periodo - Parâmetros: p_data_inicio=%, p_data_fim=%, p_categoria_filter=%', 
    p_data_inicio, p_data_fim, p_categoria_filter;

  RETURN QUERY
  SELECT 
    e.id,
    e.titulo,
    e.descricao,
    e.tipo_evento,
    e.categoria,
    e.data_evento,
    e.data_fim as data_fim_evento,
    e.animal_id,
    e.voluntario_id,
    e.status,
    e.prioridade,
    e.local,
    e.observacoes,
    e.metadados,
    e.cor_evento,
    e.icone_evento,
    a.nome as animal_nome,
    v.nome as voluntario_nome
  FROM agenda_eventos_unificada_2026_01_09_09_00 e
  LEFT JOIN animais a ON e.animal_id = a.id
  LEFT JOIN voluntarios v ON e.voluntario_id = v.id
  WHERE 
    (p_data_inicio IS NULL OR DATE(e.data_evento) >= p_data_inicio::DATE)
    AND (p_data_fim IS NULL OR DATE(e.data_evento) <= p_data_fim::DATE)
    AND (p_categoria_filter IS NULL OR p_categoria_filter = '' OR e.categoria = p_categoria_filter)
    AND (p_tipo_filter IS NULL OR p_tipo_filter = '' OR e.tipo_evento = p_tipo_filter)
    AND (p_animal_filter IS NULL OR p_animal_filter = '' OR e.animal_id::TEXT = p_animal_filter)
    AND (p_voluntario_filter IS NULL OR p_voluntario_filter = '' OR e.voluntario_id::TEXT = p_voluntario_filter)
  ORDER BY e.data_evento ASC;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro na função get_agenda_eventos_periodo: % %', SQLSTATE, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 3. TESTAR A FUNÇÃO CORRIGIDA
SELECT COUNT(*) as total_eventos 
FROM get_agenda_eventos_periodo(
  (CURRENT_DATE - INTERVAL '30 days')::TEXT,
  (CURRENT_DATE + INTERVAL '30 days')::TEXT,
  NULL, NULL, NULL, NULL
);

-- 4. VERIFICAR ASSINATURA FINAL
SELECT 
  'FUNÇÃO RPC CORRIGIDA:' as info,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_agenda_eventos_periodo'
AND n.nspname = 'public';