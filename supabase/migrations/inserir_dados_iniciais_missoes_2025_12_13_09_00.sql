-- Inserir tipos de missões práticas
INSERT INTO tipos_missoes_2025_12_13_09_00 (codigo, nome, descricao, cor, icone, categoria, requer_equipamentos, requer_veiculo) VALUES
('RES001', 'Resgate de Animal', 'Missão de resgate de animal em situação de risco', '#DC2626', 'shield', 'resgate', true, true),
('TRA001', 'Transporte Veterinário', 'Transporte de animal para consulta ou tratamento veterinário', '#2563EB', 'truck', 'transporte', false, true),
('VAC001', 'Vacinação', 'Levar animal para tomar vacinas', '#059669', 'syringe', 'cuidados', false, true),
('LIM001', 'Limpeza do Canil', 'Limpeza e manutenção das instalações', '#7C3AED', 'broom', 'limpeza', true, false),
('CAM001', 'Campanha de Adoção', 'Organização de evento para promoção de adoções', '#EA580C', 'megaphone', 'campanha', true, false),
('ADM001', 'Tarefa Administrativa', 'Atividades administrativas e burocráticas', '#6B7280', 'clipboard', 'administrativo', false, false),
('CIR001', 'Cirurgia', 'Acompanhamento de animal em cirurgia', '#DC2626', 'scissors', 'cuidados', false, true),
('TRE001', 'Treinamento', 'Sessão de treinamento e socialização de animal', '#10B981', 'graduation-cap', 'cuidados', true, false),
('VIS001', 'Visita Domiciliária', 'Visita para avaliação de adoção ou acompanhamento', '#3B82F6', 'home', 'administrativo', false, true),
('DOA001', 'Recolha de Doações', 'Recolha de doações de ração, medicamentos ou outros', '#F59E0B', 'gift', 'administrativo', false, true);

-- Inserir missões de exemplo
INSERT INTO missoes_2025_12_13_09_00 (
    codigo, tipo_missao_id, titulo, descricao, objetivo, 
    data_inicio, data_fim, hora_inicio, hora_fim, 
    local_principal, prioridade, status, orcamento_previsto,
    criado_por, responsavel_id
) VALUES
(
    'MIS001', 
    (SELECT id FROM tipos_missoes_2025_12_13_09_00 WHERE codigo = 'RES001'),
    'Resgate de Cão Abandonado',
    'Resgate de cão encontrado abandonado na estrada nacional',
    'Resgatar o animal em segurança e transportar para a associação',
    '2025-12-15', '2025-12-15', '09:00', '12:00',
    'Estrada Nacional 18, Km 45',
    'alta', 'planejada', 50.00,
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1),
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1)
),
(
    'MIS002',
    (SELECT id FROM tipos_missoes_2025_12_13_09_00 WHERE codigo = 'VAC001'),
    'Vacinação do Rex',
    'Levar o cão Rex para tomar a vacina anual',
    'Garantir que o Rex receba todas as vacinas necessárias',
    '2025-12-16', '2025-12-16', '14:00', '16:00',
    'Clínica Veterinária PecVet',
    'media', 'planejada', 35.00,
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1),
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1)
),
(
    'MIS003',
    (SELECT id FROM tipos_missoes_2025_12_13_09_00 WHERE codigo = 'LIM001'),
    'Limpeza Semanal do Canil',
    'Limpeza completa das instalações do canil',
    'Manter as instalações limpas e higienizadas',
    '2025-12-14', '2025-12-14', '08:00', '12:00',
    'Canil da Associação',
    'media', 'em_andamento', 25.00,
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1),
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1)
);

-- Inserir participações de exemplo
INSERT INTO participacoes_missoes_2025_12_13_09_00 (
    missao_id, voluntario_id, funcao, horas_dedicadas, 
    data_participacao, hora_inicio, hora_fim, observacoes
) VALUES
(
    (SELECT id FROM missoes_2025_12_13_09_00 WHERE codigo = 'MIS001'),
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1),
    'Coordenador', 3.0, '2025-12-15', '09:00', '12:00',
    'Responsável pela coordenação do resgate'
),
(
    (SELECT id FROM missoes_2025_12_13_09_00 WHERE codigo = 'MIS003'),
    (SELECT id FROM voluntarios WHERE email = 'admin@admin.com' LIMIT 1),
    'Limpeza', 4.0, '2025-12-14', '08:00', '12:00',
    'Limpeza completa realizada'
);

-- Configurar RLS (Row Level Security) para todas as tabelas
ALTER TABLE tipos_missoes_2025_12_13_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes_2025_12_13_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE participacoes_missoes_2025_12_13_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_missoes_2025_12_13_09_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_financeiros_missoes_2025_12_13_09_00 ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS permissivas para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON tipos_missoes_2025_12_13_09_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON missoes_2025_12_13_09_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON participacoes_missoes_2025_12_13_09_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON equipamentos_missoes_2025_12_13_09_00 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON movimentos_financeiros_missoes_2025_12_13_09_00 FOR ALL USING (true) WITH CHECK (true);

-- Criar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tipos_missoes_updated_at BEFORE UPDATE ON tipos_missoes_2025_12_13_09_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missoes_updated_at BEFORE UPDATE ON missoes_2025_12_13_09_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participacoes_updated_at BEFORE UPDATE ON participacoes_missoes_2025_12_13_09_00 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();