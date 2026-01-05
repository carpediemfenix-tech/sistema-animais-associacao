-- Inserir mais missões com códigos únicos
INSERT INTO public.missoes_2025_12_18_14_15 (
    codigo, 
    titulo, 
    descricao, 
    data_inicio, 
    status, 
    prioridade, 
    local_principal,
    orcamento_previsto,
    responsavel_id
)
SELECT 
    'MISS-01-2026-002',
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

INSERT INTO public.missoes_2025_12_18_14_15 (
    codigo, 
    titulo, 
    descricao, 
    data_inicio, 
    status, 
    prioridade, 
    local_principal,
    orcamento_previsto,
    responsavel_id
)
SELECT 
    'MISS-01-2026-003',
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

-- Inserir participações para o voluntário específico
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Coordenador' as funcao,
    m.data_inicio as data_participacao,
    'Responsável pela coordenação geral da missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
WHERE m.codigo IN ('MISS-01-2026-001', 'MISS-01-2026-002')
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Voluntário' as funcao,
    m.data_inicio as data_participacao,
    'Apoio nas atividades de campo e transporte de animais' as observacoes
FROM public.missoes_2025_12_18_14_15 m
WHERE m.codigo = 'MISS-01-2026-003'
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

-- Verificar se as participações foram criadas
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