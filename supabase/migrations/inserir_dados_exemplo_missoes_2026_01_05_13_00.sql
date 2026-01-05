-- Inserir dados de exemplo para missões
INSERT INTO public.missoes_2025_12_18_14_15 (titulo, descricao, data_inicio, data_fim, status, prioridade, local_principal, orcamento_previsto, responsavel_id)
SELECT 
    'Missão de Resgate - ' || EXTRACT(MONTH FROM CURRENT_DATE) || '/' || EXTRACT(YEAR FROM CURRENT_DATE),
    'Operação de resgate e cuidados veterinários para animais em situação de risco',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '10 days',
    'concluida',
    'alta',
    'Centro da Cidade',
    500.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.missoes_2025_12_18_14_15 (titulo, descricao, data_inicio, status, prioridade, local_principal, orcamento_previsto, responsavel_id)
SELECT 
    'Campanha de Vacinação',
    'Campanha de vacinação antirrábica para animais da comunidade',
    CURRENT_DATE + INTERVAL '5 days',
    'ativa',
    'media',
    'Parque Municipal',
    300.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.missoes_2025_12_18_14_15 (titulo, descricao, data_inicio, status, prioridade, local_principal, orcamento_previsto, responsavel_id)
SELECT 
    'Feira de Adoção',
    'Evento para promover a adoção responsável de animais',
    CURRENT_DATE - INTERVAL '5 days',
    'ativa',
    'media',
    'Shopping Center',
    200.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Inserir participações de exemplo para o voluntário específico
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Coordenador' as funcao,
    m.data_inicio as data_participacao,
    'Responsável pela coordenação geral da missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
LIMIT 2
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Voluntário' as funcao,
    m.data_inicio as data_participacao,
    'Apoio nas atividades de campo e transporte de animais' as observacoes
FROM public.missoes_2025_12_18_14_15 m
WHERE m.titulo = 'Feira de Adoção'
LIMIT 1
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

-- Inserir mais participações para outros voluntários
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    v.id as voluntario_id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 0 THEN 'Coordenador'
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'Voluntário'
        ELSE 'Apoio Técnico'
    END as funcao,
    m.data_inicio as data_participacao,
    'Participação ativa na missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
CROSS JOIN public.voluntarios v
WHERE v.ativo = true
AND v.id != 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
LIMIT 10
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 
    p.id,
    p.voluntario_id,
    p.funcao,
    p.data_participacao,
    m.titulo,
    m.status,
    m.prioridade
FROM public.participacoes_missoes_2025_12_29_07_00 p
JOIN public.missoes_2025_12_18_14_15 m ON p.missao_id = m.id
WHERE p.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;