-- CORREÇÃO CRÍTICA - RPC AGENDA get_agenda_eventos_periodo
-- Verificar assinatura atual e corrigir

-- 1. VERIFICAR FUNÇÃO ATUAL
SELECT 
  'FUNÇÃO get_agenda_eventos_periodo:' as info,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_agenda_eventos_periodo'
AND n.nspname = 'public';

-- 2. REMOVER TODAS AS VERSÕES EXISTENTES
DROP FUNCTION IF EXISTS get_agenda_eventos_periodo(DATE, DATE, TEXT, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS get_agenda_eventos_periodo(TEXT, TEXT, TEXT, TEXT, UUID, UUID);

-- 3. CRIAR FUNÇÃO COM ASSINATURA SIMPLES E CLARA
CREATE OR REPLACE FUNCTION get_agenda_eventos_periodo(
  data_inicio TEXT,
  data_fim TEXT,
  categoria_filter TEXT DEFAULT NULL,
  tipo_filter TEXT DEFAULT NULL,
  animal_filter TEXT DEFAULT NULL,
  voluntario_filter TEXT DEFAULT NULL
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
  RAISE NOTICE 'RPC get_agenda_eventos_periodo - Parâmetros: data_inicio=%, data_fim=%, categoria_filter=%, tipo_filter=%, animal_filter=%, voluntario_filter=%', 
    data_inicio, data_fim, categoria_filter, tipo_filter, animal_filter, voluntario_filter;

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
    (data_inicio IS NULL OR DATE(e.data_evento) >= data_inicio::DATE)
    AND (data_fim IS NULL OR DATE(e.data_evento) <= data_fim::DATE)
    AND (categoria_filter IS NULL OR categoria_filter = '' OR e.categoria = categoria_filter)
    AND (tipo_filter IS NULL OR tipo_filter = '' OR e.tipo_evento = tipo_filter)
    AND (animal_filter IS NULL OR animal_filter = '' OR e.animal_id::TEXT = animal_filter)
    AND (voluntario_filter IS NULL OR voluntario_filter = '' OR e.voluntario_id::TEXT = voluntario_filter)
  ORDER BY e.data_evento ASC;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro na função get_agenda_eventos_periodo: % % - Parâmetros: data_inicio=%, data_fim=%', 
      SQLSTATE, SQLERRM, data_inicio, data_fim;
END;
$$ LANGUAGE plpgsql;

-- 4. TESTAR A FUNÇÃO
SELECT COUNT(*) as total_eventos 
FROM get_agenda_eventos_periodo(
  (CURRENT_DATE - INTERVAL '30 days')::TEXT,
  (CURRENT_DATE + INTERVAL '30 days')::TEXT,
  NULL, NULL, NULL, NULL
);

-- 5. VERIFICAR SE A FUNÇÃO FOI CRIADA CORRETAMENTE
SELECT 
  'FUNÇÃO CRIADA COM SUCESSO:' as info,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_agenda_eventos_periodo'
AND n.nspname = 'public';