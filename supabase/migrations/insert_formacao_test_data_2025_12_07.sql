-- DADOS FICTÍCIOS PARA TESTE DO SISTEMA DE FORMAÇÃO
-- Dados realistas para testes em 2025/2026
-- Criado em: 2025-12-07 04:00 UTC

-- 1. INSERIR TIPOS DE FORMAÇÃO (Templates)
INSERT INTO public.tipos_formacao (codigo, nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone) VALUES
('FORMA_BASE', 'FORMA BASE', 'Formação básica obrigatória para todos os voluntários. Inclui cuidados básicos com animais, primeiros socorros e protocolos de segurança.', 1, 40, 
 '["Cuidados básicos com animais", "Primeiros socorros veterinários", "Protocolos de segurança", "Ética no resgate", "Comunicação eficaz"]'::jsonb, 
 '[]'::jsonb, '#10B981', '🌱'),

('FORMA_N1', 'Formação Nível 1', 'Primeiro nível de especialização em resgate e maneio avançado de animais. Capacita para operações de resgate básicas.', 2, 60, 
 '["Técnicas de resgate básico", "Maneio de animais agressivos", "Avaliação comportamental", "Uso de equipamentos", "Trabalho em equipa"]'::jsonb, 
 '["FORMA_BASE"]'::jsonb, '#3B82F6', '🛡️'),

('FORMA_N2', 'Formação Nível 2', 'Nível intermédio com competências de liderança e coordenação de equipas. Preparação para liderar operações de resgate.', 3, 80, 
 '["Liderança de equipas", "Coordenação de operações", "Gestão de emergências", "Formação de voluntários", "Planeamento estratégico"]'::jsonb, 
 '["FORMA_N1"]'::jsonb, '#8B5CF6', '⚔️'),

('FORMA_N3', 'Formação Nível 3', 'Nível máximo de formação. Capacita para formar outros formadores e gerir o sistema de formação da associação.', 4, 100, 
 '["Formação de formadores", "Gestão do sistema formativo", "Desenvolvimento curricular", "Avaliação de competências", "Supervisão geral"]'::jsonb, 
 '["FORMA_N2"]'::jsonb, '#F59E0B', '👑'),

('FORMA_VET', 'Especialização Veterinária', 'Especialização em cuidados veterinários avançados e procedimentos médicos de emergência.', 5, 120, 
 '["Procedimentos veterinários", "Farmacologia básica", "Cirurgia de emergência", "Diagnóstico clínico", "Cuidados intensivos"]'::jsonb, 
 '["FORMA_N1"]'::jsonb, '#EF4444', '🏥'),

('FORMA_RESCUE', 'Especialização em Resgate', 'Especialização em técnicas avançadas de resgate em situações complexas e perigosas.', 5, 100, 
 '["Resgate em altura", "Resgate aquático", "Operações noturnas", "Uso de drones", "Coordenação com autoridades"]'::jsonb, 
 '["FORMA_N2"]'::jsonb, '#F97316', '🚁');

-- 2. INSERIR AÇÕES DE FORMAÇÃO PARA 2025/2026 (Instâncias)
INSERT INTO public.acoes_formacao (codigo_acao, tipo_formacao_id, nome_acao, descricao, formador, local_formacao, data_inicio, data_fim, carga_horaria_real, vagas_maximas, preco, status) VALUES

-- FORMA BASE - 2025
('ACC2501', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Janeiro 2025', 'Primeira ação de formação básica do ano 2025', 'Dr. João Silva', 'Centro de Formação VR - Lisboa', '2025-01-15', '2025-01-19', 40, 25, 0.00, 'concluida'),
('ACC2502', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Março 2025', 'Segunda ação de formação básica do ano 2025', 'Dra. Maria Santos', 'Centro de Formação VR - Porto', '2025-03-10', '2025-03-14', 40, 20, 0.00, 'concluida'),
('ACC2503', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Maio 2025', 'Terceira ação de formação básica do ano 2025', 'Dr. Pedro Costa', 'Centro de Formação VR - Coimbra', '2025-05-12', '2025-05-16', 40, 30, 0.00, 'concluida'),

-- FORMA N1 - 2025
('ACC2504', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N1'), 'FORMA N1 - Fevereiro 2025', 'Primeira ação de Nível 1 do ano 2025', 'Eng. Ana Rodrigues', 'Centro de Formação VR - Lisboa', '2025-02-03', '2025-02-07', 60, 15, 50.00, 'concluida'),
('ACC2505', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N1'), 'FORMA N1 - Junho 2025', 'Segunda ação de Nível 1 do ano 2025', 'Dr. Carlos Mendes', 'Centro de Formação VR - Porto', '2025-06-02', '2025-06-06', 60, 18, 50.00, 'concluida'),

-- FORMA N2 - 2025
('ACC2506', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N2'), 'FORMA N2 - Abril 2025', 'Primeira ação de Nível 2 do ano 2025', 'Prof. Sofia Almeida', 'Centro de Formação VR - Lisboa', '2025-04-07', '2025-04-11', 80, 12, 75.00, 'concluida'),

-- FORMA N3 - 2025
('ACC2507', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N3'), 'FORMA N3 - Setembro 2025', 'Primeira ação de Nível 3 do ano 2025', 'Dr. Miguel Ferreira', 'Centro de Formação VR - Lisboa', '2025-09-15', '2025-09-19', 100, 8, 100.00, 'concluida'),

-- ESPECIALIZAÇÕES - 2025
('ACC2508', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_VET'), 'Especialização Veterinária - Outubro 2025', 'Primeira especialização veterinária do ano', 'Dra. Veterinária Isabel Nunes', 'Hospital Veterinário VR', '2025-10-20', '2025-10-24', 120, 10, 150.00, 'concluida'),
('ACC2509', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_RESCUE'), 'Especialização Resgate - Novembro 2025', 'Primeira especialização em resgate do ano', 'Comandante Rui Oliveira', 'Centro de Treino Tático', '2025-11-18', '2025-11-22', 100, 12, 125.00, 'concluida'),

-- AÇÕES PLANEADAS PARA 2026
('ACC2601', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Janeiro 2026', 'Primeira ação de formação básica de 2026', 'Dr. João Silva', 'Centro de Formação VR - Lisboa', '2026-01-20', '2026-01-24', 40, 25, 0.00, 'planeada'),
('ACC2602', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_BASE'), 'FORMA BASE - Março 2026', 'Segunda ação de formação básica de 2026', 'Dra. Maria Santos', 'Centro de Formação VR - Porto', '2026-03-16', '2026-03-20', 40, 20, 0.00, 'inscricoes_abertas'),
('ACC2603', (SELECT id FROM public.tipos_formacao WHERE codigo = 'FORMA_N1'), 'FORMA N1 - Fevereiro 2026', 'Primeira ação de Nível 1 de 2026', 'Eng. Ana Rodrigues', 'Centro de Formação VR - Lisboa', '2026-02-09', '2026-02-13', 60, 15, 50.00, 'inscricoes_abertas');

-- 3. INSERIR ALGUMAS PARTICIPAÇÕES FICTÍCIAS (se existirem voluntários)
-- Verificar se existem voluntários e inserir participações de exemplo
DO $$
DECLARE
    voluntario_id_1 UUID;
    voluntario_id_2 UUID;
    acao_id_1 UUID;
    acao_id_2 UUID;
BEGIN
    -- Buscar alguns voluntários existentes
    SELECT id INTO voluntario_id_1 FROM public.voluntarios WHERE ativo = true LIMIT 1;
    SELECT id INTO voluntario_id_2 FROM public.voluntarios WHERE ativo = true OFFSET 1 LIMIT 1;
    
    -- Buscar algumas ações
    SELECT id INTO acao_id_1 FROM public.acoes_formacao WHERE codigo_acao = 'ACC2501';
    SELECT id INTO acao_id_2 FROM public.acoes_formacao WHERE codigo_acao = 'ACC2502';
    
    -- Inserir participações se existirem voluntários
    IF voluntario_id_1 IS NOT NULL AND acao_id_1 IS NOT NULL THEN
        INSERT INTO public.participacoes_formacao (voluntario_id, acao_formacao_id, status_participacao, nota_final, percentagem_presenca, certificado_emitido, data_certificado)
        VALUES (voluntario_id_1, acao_id_1, 'aprovado', 18.5, 100.0, true, '2025-01-25');
    END IF;
    
    IF voluntario_id_2 IS NOT NULL AND acao_id_2 IS NOT NULL THEN
        INSERT INTO public.participacoes_formacao (voluntario_id, acao_formacao_id, status_participacao, nota_final, percentagem_presenca, certificado_emitido, data_certificado)
        VALUES (voluntario_id_2, acao_id_2, 'aprovado', 16.8, 95.0, true, '2025-03-18');
    END IF;
END $$;

-- Comentários finais
COMMENT ON TABLE public.tipos_formacao IS 'Dados de teste inseridos - 6 tipos de formação disponíveis';
COMMENT ON TABLE public.acoes_formacao IS 'Dados de teste inseridos - 12 ações de formação (9 concluídas em 2025, 3 planeadas para 2026)';
COMMENT ON TABLE public.participacoes_formacao IS 'Dados de teste inseridos - participações de exemplo se existirem voluntários';