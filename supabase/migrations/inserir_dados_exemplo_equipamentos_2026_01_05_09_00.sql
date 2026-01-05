-- Inserir categorias padrão
INSERT INTO categorias_equipamentos_2025_12_13_01_00 (nome, descricao, codigo, cor, icone, ordem) VALUES
('Proteção Individual', 'Equipamentos de proteção individual para voluntários', 'EPI', '#10B981', 'Shield', 1),
('Transporte', 'Equipamentos para transporte de animais', 'TRANS', '#3B82F6', 'Truck', 2),
('Cuidados Veterinários', 'Equipamentos médicos e veterinários', 'VET', '#EF4444', 'Heart', 3),
('Comunicação', 'Equipamentos de comunicação e tecnologia', 'COM', '#8B5CF6', 'Smartphone', 4),
('Vestuário', 'Uniformes e vestuário da associação', 'VEST', '#F59E0B', 'Shirt', 5)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir tipos padrão
INSERT INTO tipos_equipamentos_2025_12_13_01_00 (categoria_id, nome, descricao, codigo, unidade_medida, vida_util_meses, requer_manutencao, valor_unitario) VALUES
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Luvas de Proteção', 'Luvas descartáveis para manuseio de animais', 'LUV001', 'par', 1, false, 2.50),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI'), 'Máscara de Proteção', 'Máscaras N95 para proteção respiratória', 'MAS001', 'unidade', 1, false, 1.20),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRANS'), 'Transportadora Pequena', 'Transportadora para animais pequenos', 'TRP001', 'unidade', 60, true, 45.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRANS'), 'Transportadora Grande', 'Transportadora para animais grandes', 'TRP002', 'unidade', 60, true, 85.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'VET'), 'Termômetro Digital', 'Termômetro para medição de temperatura', 'TER001', 'unidade', 24, false, 15.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'COM'), 'Rádio Comunicador', 'Rádio para comunicação em campo', 'RAD001', 'unidade', 36, true, 120.00),
((SELECT id FROM categorias_equipamentos_2025_12_13_01_00 WHERE codigo = 'VEST'), 'Colete Identificação', 'Colete com logotipo da associação', 'COL001', 'unidade', 24, false, 25.00)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir alguns equipamentos de exemplo
INSERT INTO equipamentos_2025_12_13_01_00 (tipo_equipamento_id, codigo, numero_serie, estado, data_aquisicao, valor_aquisicao, localizacao) VALUES
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001'), 'TRP001-001', 'TP2024001', 'disponivel', '2024-01-15', 45.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001'), 'TRP001-002', 'TP2024002', 'em_uso', '2024-01-15', 45.00, 'Em Campo'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP002'), 'TRP002-001', 'TG2024001', 'disponivel', '2024-02-10', 85.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001'), 'RAD001-001', 'RC2024001', 'disponivel', '2024-03-05', 120.00, 'Escritório'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001'), 'RAD001-002', 'RC2024002', 'manutencao', '2024-03-05', 120.00, 'Oficina'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COL001'), 'COL001-001', 'CV2024001', 'disponivel', '2024-01-20', 25.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'COL001'), 'COL001-002', 'CV2024002', 'disponivel', '2024-01-20', 25.00, 'Armazém Principal'),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'TER001'), 'TER001-001', 'TD2024001', 'disponivel', '2024-02-15', 15.00, 'Kit Veterinário')
ON CONFLICT (codigo) DO NOTHING;

-- Criar alguns alertas de exemplo
INSERT INTO alertas_equipamentos_2025_12_16_07_00 (equipamento_id, tipo_alerta, titulo, descricao, prioridade) VALUES
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001-002'), 'manutencao', 'Manutenção Preventiva Pendente', 'Rádio comunicador necessita de manutenção preventiva', 'media'),
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001-002'), 'devolucao', 'Devolução em Atraso', 'Transportadora deveria ter sido devolvida há 3 dias', 'alta')
ON CONFLICT DO NOTHING;

-- Criar algumas manutenções de exemplo
INSERT INTO manutencoes_equipamentos_2025_12_13_01_00 (equipamento_id, tipo_manutencao, data_agendada, status, descricao, responsavel) VALUES
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'RAD001-002'), 'preventiva', '2026-01-10', 'agendada', 'Limpeza e verificação de componentes', 'João Silva'),
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001-001'), 'preventiva', '2026-01-15', 'agendada', 'Verificação de fechos e limpeza', 'Maria Santos')
ON CONFLICT DO NOTHING;

-- Criar algumas atribuições de exemplo
INSERT INTO atribuicoes_equipamentos_2025_12_13_01_00 (equipamento_id, voluntario_id, data_atribuicao, data_devolucao_prevista, estado) VALUES
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo = 'TRP001-002'), 
 (SELECT id FROM voluntarios WHERE nome ILIKE '%voluntário%' LIMIT 1), 
 '2025-12-28', '2026-01-05', 'ativo')
ON CONFLICT DO NOTHING;