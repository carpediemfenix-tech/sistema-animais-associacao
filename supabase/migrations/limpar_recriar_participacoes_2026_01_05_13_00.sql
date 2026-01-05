-- Desabilitar FK temporariamente para limpeza
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 DISABLE TRIGGER ALL;

-- Limpar dados órfãos
DELETE FROM public.participacoes_missoes_2025_12_29_07_00;
DELETE FROM public.missoes_2025_12_18_14_15;

-- Reabilitar triggers
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 ENABLE TRIGGER ALL;

-- Inserir missões válidas
INSERT INTO public.missoes_2025_12_18_14_15 (
    id, codigo, titulo, descricao, data_inicio, status, prioridade, 
    local_principal, orcamento_previsto, responsavel_id
) VALUES (
    gen_random_uuid(),
    'MISS-2026-001',
    'Missão de Resgate Janeiro',
    'Operação de resgate de animais abandonados no centro da cidade',
    CURRENT_DATE - INTERVAL '10 days',
    'concluida',
    'alta',
    'Centro da Cidade',
    500.00,
    (SELECT id FROM public.voluntarios WHERE ativo = true LIMIT 1)
);

INSERT INTO public.missoes_2025_12_18_14_15 (
    id, codigo, titulo, descricao, data_inicio, status, prioridade, 
    local_principal, orcamento_previsto, responsavel_id
) VALUES (
    gen_random_uuid(),
    'MISS-2026-002',
    'Campanha de Vacinação',
    'Vacinação antirrábica para animais da comunidade',
    CURRENT_DATE - INTERVAL '5 days',
    'concluida',
    'media',
    'Parque Municipal',
    300.00,
    (SELECT id FROM public.voluntarios WHERE ativo = true LIMIT 1)
);

-- Inserir participações para o Jorge António (assumindo que é o ID fornecido)
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Coordenador',
    m.data_inicio,
    'Coordenação geral da missão'
FROM public.missoes_2025_12_18_14_15 m
WHERE m.codigo = 'MISS-2026-001';

INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Voluntário',
    m.data_inicio,
    'Apoio nas atividades de campo'
FROM public.missoes_2025_12_18_14_15 m
WHERE m.codigo = 'MISS-2026-002';

-- Verificar se funcionou
SELECT 
    p.funcao,
    p.data_participacao,
    m.titulo,
    m.status,
    m.prioridade,
    m.local_principal
FROM public.participacoes_missoes_2025_12_29_07_00 p
JOIN public.missoes_2025_12_18_14_15 m ON p.missao_id = m.id
WHERE p.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;