-- Dados de Exemplo para Sistema de Equipamentos
-- Criado em: 2025-12-13 01:00 UTC

-- 1. Inserir equipamentos de exemplo
INSERT INTO equipamentos_2025_12_13_01_00 (tipo_equipamento_id, codigo_interno, numero_serie, data_aquisicao, estado, localizacao, condicao, valor_aquisicao) VALUES
-- EPI
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_LUVAS'), 'EPI001', 'LUV2024001', '2024-01-15', 'disponivel', 'Armazém A - Prateleira 1', 'novo', 15.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_LUVAS'), 'EPI002', 'LUV2024002', '2024-01-15', 'em_uso', 'Com Voluntário', 'bom', 15.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_MASCARA'), 'EPI003', 'MAS2024001', '2024-02-01', 'disponivel', 'Armazém A - Prateleira 1', 'novo', 2.50),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_OCULOS'), 'EPI004', 'OCU2024001', '2024-01-20', 'disponivel', 'Armazém A - Prateleira 2', 'novo', 25.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_BOTAS'), 'EPI005', 'BOT2024001', '2024-03-10', 'em_uso', 'Com Voluntário', 'bom', 80.00),

-- Material de Resgate
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE_TRANSP_G'), 'RES001', 'TRG2024001', '2024-01-10', 'disponivel', 'Garagem - Setor B', 'bom', 120.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE_TRANSP_P'), 'RES002', 'TRP2024001', '2024-01-10', 'disponivel', 'Garagem - Setor B', 'bom', 80.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE_REDE'), 'RES003', 'RED2024001', '2024-02-15', 'em_uso', 'Viatura de Resgate', 'bom', 45.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE_CORDA'), 'RES004', 'COR2024001', '2024-02-15', 'disponivel', 'Garagem - Setor A', 'novo', 35.00),

-- Primeiros Socorros
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'PS_KIT_COMPLETO'), 'PS001', 'KIT2024001', '2024-01-05', 'disponivel', 'Enfermaria - Armário 1', 'novo', 65.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'PS_TERMOMETRO'), 'PS002', 'TER2024001', '2024-01-05', 'em_uso', 'Com Veterinário', 'bom', 25.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'PS_SERINGAS'), 'PS003', 'SER2024001', '2024-03-01', 'disponivel', 'Enfermaria - Frigorífico', 'novo', 25.00),

-- Registo Digital
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL_TABLET'), 'DIG001', 'TAB2024001', '2024-02-20', 'em_uso', 'Com Coordenador', 'bom', 300.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL_CAMERA'), 'DIG002', 'CAM2024001', '2024-01-30', 'disponivel', 'Escritório - Gaveta 2', 'novo', 450.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'DIGITAL_LEITOR_CHIP'), 'DIG003', 'LEI2024001', '2024-02-10', 'disponivel', 'Receção - Balcão', 'novo', 180.00),

-- Fardamento
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARD_TSHIRT'), 'FAR001', 'TSH2024001', '2024-01-25', 'em_uso', 'Com Voluntário', 'bom', 18.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARD_COLETE'), 'FAR002', 'COL2024001', '2024-01-25', 'disponivel', 'Vestiário - Armário 3', 'novo', 35.00),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARD_BONE'), 'FAR003', 'BON2024001', '2024-02-05', 'disponivel', 'Vestiário - Armário 3', 'novo', 12.00);

-- 2. Inserir atribuições de exemplo (assumindo que existem voluntários)
DO $$
DECLARE
    voluntario_id_1 UUID;
    voluntario_id_2 UUID;
    equipamento_luvas UUID;
    equipamento_botas UUID;
    equipamento_tshirt UUID;
    equipamento_tablet UUID;
    equipamento_termometro UUID;
    equipamento_rede UUID;
BEGIN
    -- Buscar IDs de voluntários (primeiros 2 encontrados)
    SELECT id INTO voluntario_id_1 FROM voluntarios WHERE ativo = true LIMIT 1;
    SELECT id INTO voluntario_id_2 FROM voluntarios WHERE ativo = true OFFSET 1 LIMIT 1;
    
    -- Buscar IDs de equipamentos em uso
    SELECT id INTO equipamento_luvas FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI002';
    SELECT id INTO equipamento_botas FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'EPI005';
    SELECT id INTO equipamento_tshirt FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'FAR001';
    SELECT id INTO equipamento_tablet FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001';
    SELECT id INTO equipamento_termometro FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'PS002';
    SELECT id INTO equipamento_rede FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES003';
    
    -- Inserir atribuições se os voluntários existirem
    IF voluntario_id_1 IS NOT NULL AND voluntario_id_2 IS NOT NULL THEN
        INSERT INTO atribuicoes_equipamentos_2025_12_13_01_00 (equipamento_id, voluntario_id, motivo_atribuicao, estado_entrega, observacoes_entrega, responsavel_entrega_id) VALUES
        (equipamento_luvas, voluntario_id_1, 'Operações de resgate', 'novo', 'Luvas novas entregues para operações', voluntario_id_2),
        (equipamento_botas, voluntario_id_1, 'Equipamento de segurança', 'novo', 'Botas de segurança para trabalho de campo', voluntario_id_2),
        (equipamento_tshirt, voluntario_id_1, 'Uniforme da associação', 'novo', 'T-shirt oficial da associação', voluntario_id_2),
        (equipamento_tablet, voluntario_id_2, 'Registo digital de animais', 'bom', 'Tablet para registo no terreno', voluntario_id_1),
        (equipamento_termometro, voluntario_id_2, 'Primeiros socorros', 'novo', 'Termómetro para avaliação de animais', voluntario_id_1),
        (equipamento_rede, voluntario_id_1, 'Operação de resgate', 'bom', 'Rede para captura de animais feridos', voluntario_id_2);
    END IF;
END $$;

-- 3. Inserir manutenções de exemplo
INSERT INTO manutencoes_equipamentos_2025_12_13_01_00 (equipamento_id, tipo_manutencao, data_manutencao, data_proxima_manutencao, descricao, custo, status) VALUES
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES001'), 'preventiva', '2024-03-15', '2024-06-15', 'Limpeza e verificação de fechos da transportadora', 0.00, 'concluida'),
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG001'), 'preventiva', '2024-03-20', '2024-06-20', 'Atualização de software e limpeza', 0.00, 'concluida'),
((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG002'), 'revisao', '2024-04-01', '2024-10-01', 'Revisão geral da câmara fotográfica', 25.00, 'concluida');

-- 4. Inserir histórico de utilização
DO $$
DECLARE
    voluntario_id_1 UUID;
    voluntario_id_2 UUID;
BEGIN
    -- Buscar IDs de voluntários
    SELECT id INTO voluntario_id_1 FROM voluntarios WHERE ativo = true LIMIT 1;
    SELECT id INTO voluntario_id_2 FROM voluntarios WHERE ativo = true OFFSET 1 LIMIT 1;
    
    IF voluntario_id_1 IS NOT NULL AND voluntario_id_2 IS NOT NULL THEN
        INSERT INTO historico_utilizacao_2025_12_13_01_00 (equipamento_id, voluntario_id, data_utilizacao, atividade, duracao_horas, condicao_antes, condicao_depois, observacoes) VALUES
        ((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES001'), voluntario_id_1, '2024-03-10 09:00:00', 'Resgate de cão abandonado', 3.5, 'bom', 'bom', 'Utilizada para transporte de cão de grande porte'),
        ((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'DIG002'), voluntario_id_2, '2024-03-12 14:00:00', 'Documentação de novos animais', 2.0, 'novo', 'novo', 'Fotografias para fichas de animais'),
        ((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'PS001'), voluntario_id_1, '2024-03-08 16:30:00', 'Primeiros socorros a gato ferido', 1.5, 'novo', 'bom', 'Kit utilizado para tratar ferimentos menores'),
        ((SELECT id FROM equipamentos_2025_12_13_01_00 WHERE codigo_interno = 'RES003'), voluntario_id_2, '2024-03-05 11:00:00', 'Captura de gato assustado', 0.5, 'bom', 'bom', 'Rede utilizada com sucesso na captura');
    END IF;
END $$;

-- 5. Configurar alertas de reposição
INSERT INTO alertas_reposicao_2025_12_13_01_00 (tipo_equipamento_id, quantidade_minima, quantidade_atual, quantidade_recomendada, alerta_ativo) VALUES
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_LUVAS'), 5, 2, 10, true),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'EPI_MASCARA'), 20, 1, 50, true),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'PS_SERINGAS'), 50, 25, 100, false),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'FARD_TSHIRT'), 3, 1, 8, true),
((SELECT id FROM tipos_equipamentos_2025_12_13_01_00 WHERE codigo = 'RESGATE_TRANSP_G'), 2, 1, 3, true);

-- 6. Atualizar quantidades atuais baseadas no inventário
UPDATE alertas_reposicao_2025_12_13_01_00 
SET quantidade_atual = (
    SELECT COUNT(*) 
    FROM equipamentos_2025_12_13_01_00 e
    WHERE e.tipo_equipamento_id = alertas_reposicao_2025_12_13_01_00.tipo_equipamento_id
    AND e.ativo = true
    AND e.estado IN ('disponivel', 'em_uso', 'manutencao')
);