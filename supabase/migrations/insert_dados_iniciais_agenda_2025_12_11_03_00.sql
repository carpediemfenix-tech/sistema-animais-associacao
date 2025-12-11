-- Dados Iniciais para Sistema de Agenda e Calendário
-- Criado em: 2025-12-11 03:00 UTC

-- 1. Inserir Tipos de Eventos
INSERT INTO tipos_eventos_2025_12_11_03_00 (nome, descricao, cor, icone, categoria, duracao_padrao, requer_aprovacao) VALUES
('Consulta Veterinária', 'Consultas médicas para animais', '#EF4444', 'Stethoscope', 'consulta', 60, false),
('Cirurgia', 'Procedimentos cirúrgicos', '#DC2626', 'Scissors', 'consulta', 180, true),
('Vacinação', 'Aplicação de vacinas', '#10B981', 'Shield', 'consulta', 30, false),
('Castração', 'Procedimentos de castração', '#F59E0B', 'Heart', 'consulta', 120, true),

('Turno Cuidados', 'Turno de cuidados com animais', '#3B82F6', 'Heart', 'turno', 240, false),
('Turno Limpeza', 'Turno de limpeza das instalações', '#8B5CF6', 'Broom', 'turno', 180, false),
('Turno Alimentação', 'Turno de alimentação dos animais', '#F97316', 'Apple', 'turno', 120, false),
('Turno Passeio', 'Turno de passeios e exercícios', '#22C55E', 'Dog', 'turno', 90, false),

('Evento Adoção', 'Eventos de adoção de animais', '#EC4899', 'Users', 'evento', 480, true),
('Formação', 'Sessões de formação para voluntários', '#6366F1', 'GraduationCap', 'formacao', 120, false),
('Reunião', 'Reuniões administrativas', '#64748B', 'Users', 'geral', 90, false),
('Angariação Fundos', 'Eventos de angariação de fundos', '#059669', 'DollarSign', 'evento', 360, true),

('Manutenção', 'Trabalhos de manutenção', '#D97706', 'Wrench', 'geral', 180, false),
('Transporte', 'Transporte de animais', '#7C3AED', 'Truck', 'geral', 60, false),
('Visita Institucional', 'Visitas de instituições ou escolas', '#BE185D', 'Eye', 'evento', 120, true);

-- 2. Inserir Eventos de Exemplo
INSERT INTO eventos_agenda_2025_12_11_03_00 (
  titulo, descricao, tipo_evento_id, data_inicio, data_fim, local, status, prioridade, observacoes
) VALUES
-- Consultas veterinárias
('Consulta Rex - Rotina', 'Consulta de rotina para o Rex', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Consulta Veterinária' LIMIT 1),
 '2025-12-12 09:00:00+00', '2025-12-12 10:00:00+00', 
 'Clínica Veterinária Central', 'agendado', 'normal', 'Levar cartão de vacinação'),

('Cirurgia Luna - Castração', 'Procedimento de castração da Luna', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Castração' LIMIT 1),
 '2025-12-13 14:00:00+00', '2025-12-13 16:00:00+00', 
 'Clínica Veterinária São Francisco', 'confirmado', 'alta', 'Jejum de 12 horas'),

-- Turnos de voluntários
('Turno Manhã - Cuidados', 'Turno matinal de cuidados gerais', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Turno Cuidados' LIMIT 1),
 '2025-12-12 08:00:00+00', '2025-12-12 12:00:00+00', 
 'Canil Principal', 'agendado', 'normal', 'Incluir limpeza das casotas'),

('Turno Tarde - Alimentação', 'Turno de alimentação da tarde', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Turno Alimentação' LIMIT 1),
 '2025-12-12 16:00:00+00', '2025-12-12 18:00:00+00', 
 'Canil Principal', 'agendado', 'normal', 'Verificar ração especial para animais doentes'),

-- Eventos especiais
('Evento Adoção Dezembro', 'Evento mensal de adoção', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Evento Adoção' LIMIT 1),
 '2025-12-14 10:00:00+00', '2025-12-14 18:00:00+00', 
 'Parque Municipal', 'agendado', 'alta', 'Preparar 20 animais para adoção'),

('Formação Primeiros Socorros', 'Formação sobre primeiros socorros em animais', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Formação' LIMIT 1),
 '2025-12-15 14:00:00+00', '2025-12-15 16:00:00+00', 
 'Sala de Formação', 'agendado', 'normal', 'Máximo 15 participantes'),

-- Reuniões
('Reunião Mensal Coordenação', 'Reunião mensal da coordenação', 
 (SELECT id FROM tipos_eventos_2025_12_11_03_00 WHERE nome = 'Reunião' LIMIT 1),
 '2025-12-16 19:00:00+00', '2025-12-16 20:30:00+00', 
 'Escritório da Associação', 'agendado', 'normal', 'Revisar relatório mensal');

-- 3. Inserir Consultas Veterinárias Detalhadas
INSERT INTO consultas_veterinarias_2025_12_11_03_00 (
  evento_id, animal_id, tipo_consulta, motivo, veterinario_nome, custo_estimado
) VALUES
((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Consulta Rex - Rotina' LIMIT 1),
 (SELECT id FROM animais WHERE nome ILIKE '%rex%' LIMIT 1),
 'rotina', 'Check-up anual e vacinação', 'Dr. António Silva', 45.00),

((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Cirurgia Luna - Castração' LIMIT 1),
 (SELECT id FROM animais WHERE nome ILIKE '%luna%' LIMIT 1),
 'castracao', 'Castração preventiva', 'Dra. Maria Santos', 120.00);

-- 4. Inserir Turnos de Voluntários
INSERT INTO turnos_voluntarios_2025_12_11_03_00 (
  evento_id, voluntario_id, funcao, local_turno, hora_inicio, hora_fim, duracao_minutos
) VALUES
((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Turno Manhã - Cuidados' LIMIT 1),
 (SELECT id FROM voluntarios WHERE ativo = true LIMIT 1),
 'cuidador', 'canil', '08:00', '12:00', 240),

((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Turno Tarde - Alimentação' LIMIT 1),
 (SELECT id FROM voluntarios WHERE ativo = true OFFSET 1 LIMIT 1),
 'alimentacao', 'canil', '16:00', '18:00', 120);

-- 5. Inserir Lembretes Automáticos
INSERT INTO lembretes_agenda_2025_12_11_03_00 (
  evento_id, tipo_lembrete, minutos_antecedencia, data_envio_programada, 
  assunto, mensagem, template_usado
) VALUES
-- Lembrete para consulta do Rex
((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Consulta Rex - Rotina' LIMIT 1),
 'email', 60, '2025-12-12 08:00:00+00',
 'Lembrete: Consulta Veterinária Rex',
 'Lembrete: A consulta do Rex está agendada para hoje às 09:00 na Clínica Veterinária Central. Não esquecer o cartão de vacinação.',
 'consulta_veterinaria'),

-- Lembrete para cirurgia da Luna
((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Cirurgia Luna - Castração' LIMIT 1),
 'email', 720, '2025-12-13 02:00:00+00',
 'Lembrete: Preparação para Cirurgia Luna',
 'Lembrete: A Luna tem cirurgia amanhã às 14:00. Iniciar jejum às 02:00 (12 horas antes).',
 'preparacao_cirurgia'),

-- Lembrete para turno
((SELECT id FROM eventos_agenda_2025_12_11_03_00 WHERE titulo = 'Turno Manhã - Cuidados' LIMIT 1),
 'email', 30, '2025-12-12 07:30:00+00',
 'Lembrete: Turno de Cuidados',
 'Lembrete: O seu turno de cuidados começa em 30 minutos (08:00). Local: Canil Principal.',
 'turno_voluntario');

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE tipos_eventos_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_agenda_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes_eventos_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos_voluntarios_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas_veterinarias_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE lembretes_agenda_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_calendario_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_atividades_2025_12_11_03_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS permissivas para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON tipos_eventos_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON eventos_agenda_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON participantes_eventos_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON turnos_voluntarios_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON consultas_veterinarias_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON lembretes_agenda_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON configuracoes_calendario_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON relatorios_atividades_2025_12_11_03_00 FOR ALL USING (true) WITH CHECK (true);

-- 7. Criar função para gerar relatórios automáticos
CREATE OR REPLACE FUNCTION gerar_relatorio_atividades(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_tipo_relatorio VARCHAR DEFAULT 'personalizado'
)
RETURNS UUID AS $$
DECLARE
  v_relatorio_id UUID;
  v_total_eventos INTEGER;
  v_eventos_concluidos INTEGER;
  v_eventos_cancelados INTEGER;
  v_total_consultas INTEGER;
  v_total_turnos INTEGER;
  v_horas_voluntariado DECIMAL(8,2);
  v_voluntarios_ativos INTEGER;
  v_taxa_presenca DECIMAL(5,2);
  v_custo_total_consultas DECIMAL(10,2);
BEGIN
  -- Calcular estatísticas
  SELECT COUNT(*) INTO v_total_eventos
  FROM eventos_agenda_2025_12_11_03_00
  WHERE DATE(data_inicio) BETWEEN p_data_inicio AND p_data_fim;

  SELECT COUNT(*) INTO v_eventos_concluidos
  FROM eventos_agenda_2025_12_11_03_00
  WHERE DATE(data_inicio) BETWEEN p_data_inicio AND p_data_fim
    AND status = 'concluido';

  SELECT COUNT(*) INTO v_eventos_cancelados
  FROM eventos_agenda_2025_12_11_03_00
  WHERE DATE(data_inicio) BETWEEN p_data_inicio AND p_data_fim
    AND status = 'cancelado';

  SELECT COUNT(*) INTO v_total_consultas
  FROM consultas_veterinarias_2025_12_11_03_00 cv
  JOIN eventos_agenda_2025_12_11_03_00 e ON cv.evento_id = e.id
  WHERE DATE(e.data_inicio) BETWEEN p_data_inicio AND p_data_fim;

  SELECT COUNT(*) INTO v_total_turnos
  FROM turnos_voluntarios_2025_12_11_03_00 tv
  JOIN eventos_agenda_2025_12_11_03_00 e ON tv.evento_id = e.id
  WHERE DATE(e.data_inicio) BETWEEN p_data_inicio AND p_data_fim;

  SELECT COALESCE(SUM(horas_trabalhadas), 0) INTO v_horas_voluntariado
  FROM turnos_voluntarios_2025_12_11_03_00 tv
  JOIN eventos_agenda_2025_12_11_03_00 e ON tv.evento_id = e.id
  WHERE DATE(e.data_inicio) BETWEEN p_data_inicio AND p_data_fim;

  SELECT COUNT(DISTINCT tv.voluntario_id) INTO v_voluntarios_ativos
  FROM turnos_voluntarios_2025_12_11_03_00 tv
  JOIN eventos_agenda_2025_12_11_03_00 e ON tv.evento_id = e.id
  WHERE DATE(e.data_inicio) BETWEEN p_data_inicio AND p_data_fim;

  -- Calcular taxa de presença (eventos com presença confirmada / total de eventos)
  SELECT 
    CASE 
      WHEN v_total_eventos > 0 THEN 
        (COUNT(*) * 100.0 / v_total_eventos)
      ELSE 0 
    END INTO v_taxa_presenca
  FROM eventos_agenda_2025_12_11_03_00
  WHERE DATE(data_inicio) BETWEEN p_data_inicio AND p_data_fim
    AND presente = true;

  SELECT COALESCE(SUM(custo_real), 0) INTO v_custo_total_consultas
  FROM consultas_veterinarias_2025_12_11_03_00 cv
  JOIN eventos_agenda_2025_12_11_03_00 e ON cv.evento_id = e.id
  WHERE DATE(e.data_inicio) BETWEEN p_data_inicio AND p_data_fim;

  -- Inserir relatório
  INSERT INTO relatorios_atividades_2025_12_11_03_00 (
    data_inicio, data_fim, tipo_relatorio,
    total_eventos, eventos_concluidos, eventos_cancelados,
    total_consultas, total_turnos, horas_voluntariado,
    voluntarios_ativos, taxa_presenca, custo_total_consultas
  ) VALUES (
    p_data_inicio, p_data_fim, p_tipo_relatorio,
    v_total_eventos, v_eventos_concluidos, v_eventos_cancelados,
    v_total_consultas, v_total_turnos, v_horas_voluntariado,
    v_voluntarios_ativos, v_taxa_presenca, v_custo_total_consultas
  ) RETURNING id INTO v_relatorio_id;

  RETURN v_relatorio_id;
END;
$$ LANGUAGE plpgsql;