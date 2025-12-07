-- CORREÇÃO: INSERIR AÇÕES DE FORMAÇÃO CORRETAMENTE
-- Criado em: 2025-12-07 04:00 UTC

-- Inserir ações de formação com sintaxe correta
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
