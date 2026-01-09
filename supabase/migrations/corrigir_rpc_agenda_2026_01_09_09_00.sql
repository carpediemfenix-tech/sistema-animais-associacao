-- VERIFICAR E CORRIGIR FUNÇÃO RPC get_agenda_eventos_periodo
-- Primeiro, verificar se a função existe e sua assinatura
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_agenda_eventos_periodo'
AND n.nspname = 'public';

-- Recriar a função com assinatura correta e tratamento de erros
DROP FUNCTION IF EXISTS get_agenda_eventos_periodo(DATE, DATE, TEXT, TEXT, UUID, UUID);

CREATE OR REPLACE FUNCTION get_agenda_eventos_periodo(
  data_inicio DATE,
  data_fim DATE,
  categoria_filter TEXT DEFAULT NULL,
  tipo_filter TEXT DEFAULT NULL,
  animal_filter UUID DEFAULT NULL,
  voluntario_filter UUID DEFAULT NULL
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
  voluntario_nome TEXT,
  tipo_nome_display TEXT,
  tipo_cor_padrao TEXT,
  tipo_icone_padrao TEXT
) AS $$
BEGIN
  -- Log dos parâmetros recebidos para debug
  RAISE NOTICE 'get_agenda_eventos_periodo called with: data_inicio=%, data_fim=%, categoria_filter=%, tipo_filter=%, animal_filter=%, voluntario_filter=%', 
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
    v.nome as voluntario_nome,
    t.nome_display as tipo_nome_display,
    t.cor_padrao as tipo_cor_padrao,
    t.icone_padrao as tipo_icone_padrao
  FROM agenda_eventos_unificada_2026_01_09_09_00 e
  LEFT JOIN animais a ON e.animal_id = a.id
  LEFT JOIN voluntarios v ON e.voluntario_id = v.id
  LEFT JOIN agenda_tipos_eventos_2026_01_09_09_00 t ON e.tipo_evento = t.tipo_evento
  WHERE 
    (data_inicio IS NULL OR DATE(e.data_evento) >= data_inicio)
    AND (data_fim IS NULL OR DATE(e.data_evento) <= data_fim)
    AND (categoria_filter IS NULL OR e.categoria = categoria_filter)
    AND (tipo_filter IS NULL OR e.tipo_evento = tipo_filter)
    AND (animal_filter IS NULL OR e.animal_id = animal_filter)
    AND (voluntario_filter IS NULL OR e.voluntario_id = voluntario_filter)
  ORDER BY e.data_evento ASC;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro na função get_agenda_eventos_periodo: % %', SQLSTATE, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Testar a função com parâmetros básicos
SELECT COUNT(*) as total_eventos FROM get_agenda_eventos_periodo(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '30 days',
  NULL, NULL, NULL, NULL
);