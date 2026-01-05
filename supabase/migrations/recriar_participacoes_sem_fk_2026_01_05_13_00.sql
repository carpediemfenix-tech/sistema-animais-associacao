-- Remover FK problemático
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 
DROP CONSTRAINT IF EXISTS participacoes_missoes_fk_correto;

-- Limpar dados
TRUNCATE public.participacoes_missoes_2025_12_29_07_00;
TRUNCATE public.missoes_2025_12_18_14_15 CASCADE;

-- Inserir missões sem FK por enquanto
INSERT INTO public.missoes_2025_12_18_14_15 (
    id, codigo, titulo, descricao, data_inicio, status, prioridade, 
    local_principal, orcamento_previsto, responsavel_id
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'MISS-2026-001',
    'Missão de Resgate Janeiro',
    'Operação de resgate de animais abandonados no centro da cidade',
    CURRENT_DATE - INTERVAL '10 days',
    'concluida',
    'alta',
    'Centro da Cidade',
    500.00,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
);

INSERT INTO public.missoes_2025_12_18_14_15 (
    id, codigo, titulo, descricao, data_inicio, status, prioridade, 
    local_principal, orcamento_previsto, responsavel_id
) VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'MISS-2026-002',
    'Campanha de Vacinação',
    'Vacinação antirrábica para animais da comunidade',
    CURRENT_DATE - INTERVAL '5 days',
    'concluida',
    'media',
    'Parque Municipal',
    300.00,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
);

-- Inserir participações
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
VALUES 
(
    '11111111-1111-1111-1111-111111111111'::uuid,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Coordenador',
    CURRENT_DATE - INTERVAL '10 days',
    'Coordenação geral da missão de resgate'
),
(
    '22222222-2222-2222-2222-222222222222'::uuid,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Voluntário',
    CURRENT_DATE - INTERVAL '5 days',
    'Apoio nas atividades de vacinação'
);

-- Verificar resultado
SELECT 
    p.funcao,
    p.data_participacao,
    m.titulo,
    m.status,
    m.prioridade,
    m.local_principal,
    m.orcamento_previsto
FROM public.participacoes_missoes_2025_12_29_07_00 p
JOIN public.missoes_2025_12_18_14_15 m ON p.missao_id = m.id
WHERE p.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;