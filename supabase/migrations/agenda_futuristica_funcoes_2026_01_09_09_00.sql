-- FUNÇÕES RPC PARA AGENDA FUTURÍSTICA
-- Função para obter estatísticas da agenda
CREATE OR REPLACE FUNCTION get_agenda_statistics()
RETURNS JSON AS $$
DECLARE
  result JSON;
  hoje DATE := CURRENT_DATE;
  proxima_semana DATE := CURRENT_DATE + INTERVAL '7 days';
BEGIN
  SELECT json_build_object(
    'eventos_hoje', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE DATE(data_evento) = hoje AND categoria = 'ativo'
    ),
    'eventos_proxima_semana', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE DATE(data_evento) BETWEEN hoje AND proxima_semana AND categoria = 'ativo'
    ),
    'eventos_ativos_total', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE categoria = 'ativo' AND data_evento >= NOW()
    ),
    'eventos_memorial_total', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE categoria = 'memorial'
    ),
    'intervencoes_agendadas', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE tipo_evento = 'intervencao_medica' AND data_evento >= NOW()
    ),
    'consultas_agendadas', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE tipo_evento = 'consulta_veterinaria' AND data_evento >= NOW()
    ),
    'missoes_ativas', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE tipo_evento IN ('missao_resgate', 'missao_adocao') AND data_evento >= NOW()
    ),
    'formacoes_programadas', (
      SELECT COUNT(*) FROM agenda_eventos_unificada_2026_01_09_09_00 
      WHERE tipo_evento = 'formacao' AND data_evento >= NOW()
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para obter eventos por período
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
  data_fim TIMESTAMP WITH TIME ZONE,
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
  RETURN QUERY
  SELECT 
    e.id,
    e.titulo,
    e.descricao,
    e.tipo_evento,
    e.categoria,
    e.data_evento,
    e.data_fim,
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
    DATE(e.data_evento) BETWEEN data_inicio AND data_fim
    AND (categoria_filter IS NULL OR e.categoria = categoria_filter)
    AND (tipo_filter IS NULL OR e.tipo_evento = tipo_filter)
    AND (animal_filter IS NULL OR e.animal_id = animal_filter)
    AND (voluntario_filter IS NULL OR e.voluntario_id = voluntario_filter)
  ORDER BY e.data_evento ASC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter timeline de um animal
CREATE OR REPLACE FUNCTION get_animal_timeline(animal_uuid UUID)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  tipo_evento TEXT,
  categoria TEXT,
  data_evento TIMESTAMP WITH TIME ZONE,
  status TEXT,
  prioridade TEXT,
  local TEXT,
  observacoes TEXT,
  metadados JSONB,
  cor_evento TEXT,
  icone_evento TEXT,
  tipo_nome_display TEXT,
  voluntario_nome TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.titulo,
    e.descricao,
    e.tipo_evento,
    e.categoria,
    e.data_evento,
    e.status,
    e.prioridade,
    e.local,
    e.observacoes,
    e.metadados,
    e.cor_evento,
    e.icone_evento,
    t.nome_display as tipo_nome_display,
    v.nome as voluntario_nome
  FROM agenda_eventos_unificada_2026_01_09_09_00 e
  LEFT JOIN agenda_tipos_eventos_2026_01_09_09_00 t ON e.tipo_evento = t.tipo_evento
  LEFT JOIN voluntarios v ON e.voluntario_id = v.id
  WHERE e.animal_id = animal_uuid
  ORDER BY e.data_evento DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter timeline de um voluntário
CREATE OR REPLACE FUNCTION get_voluntario_timeline(voluntario_uuid UUID)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  tipo_evento TEXT,
  categoria TEXT,
  data_evento TIMESTAMP WITH TIME ZONE,
  status TEXT,
  prioridade TEXT,
  local TEXT,
  observacoes TEXT,
  metadados JSONB,
  cor_evento TEXT,
  icone_evento TEXT,
  tipo_nome_display TEXT,
  animal_nome TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.titulo,
    e.descricao,
    e.tipo_evento,
    e.categoria,
    e.data_evento,
    e.status,
    e.prioridade,
    e.local,
    e.observacoes,
    e.metadados,
    e.cor_evento,
    e.icone_evento,
    t.nome_display as tipo_nome_display,
    a.nome as animal_nome
  FROM agenda_eventos_unificada_2026_01_09_09_00 e
  LEFT JOIN agenda_tipos_eventos_2026_01_09_09_00 t ON e.tipo_evento = t.tipo_evento
  LEFT JOIN animais a ON e.animal_id = a.id
  WHERE e.voluntario_id = voluntario_uuid
  ORDER BY e.data_evento DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para criar evento automaticamente
CREATE OR REPLACE FUNCTION create_agenda_evento(
  p_titulo TEXT,
  p_descricao TEXT,
  p_tipo_evento TEXT,
  p_categoria TEXT,
  p_data_evento TIMESTAMP WITH TIME ZONE,
  p_data_fim TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_animal_id UUID DEFAULT NULL,
  p_voluntario_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'agendado',
  p_prioridade TEXT DEFAULT 'normal',
  p_local TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL,
  p_metadados JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  evento_id UUID;
  tipo_config RECORD;
BEGIN
  -- Buscar configurações do tipo de evento
  SELECT * INTO tipo_config 
  FROM agenda_tipos_eventos_2026_01_09_09_00 
  WHERE tipo_evento = p_tipo_evento;
  
  -- Inserir evento
  INSERT INTO agenda_eventos_unificada_2026_01_09_09_00 (
    titulo, descricao, tipo_evento, categoria, data_evento, data_fim,
    animal_id, voluntario_id, status, prioridade, local, observacoes, metadados,
    cor_evento, icone_evento
  ) VALUES (
    p_titulo, p_descricao, p_tipo_evento, p_categoria, p_data_evento, p_data_fim,
    p_animal_id, p_voluntario_id, p_status, p_prioridade, p_local, p_observacoes, p_metadados,
    COALESCE(tipo_config.cor_padrao, '#3B82F6'),
    COALESCE(tipo_config.icone_padrao, 'Calendar')
  ) RETURNING id INTO evento_id;
  
  RETURN evento_id;
END;
$$ LANGUAGE plpgsql;