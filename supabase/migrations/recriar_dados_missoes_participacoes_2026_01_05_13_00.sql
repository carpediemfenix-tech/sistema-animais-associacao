-- Limpar dados existentes
DELETE FROM public.participacoes_missoes_2025_12_29_07_00;
DELETE FROM public.missoes_2025_12_18_14_15;

-- Inserir missão simples primeiro
INSERT INTO public.missoes_2025_12_18_14_15 (
    id,
    codigo, 
    titulo, 
    descricao, 
    data_inicio, 
    status, 
    prioridade, 
    responsavel_id
) VALUES (
    gen_random_uuid(),
    'MISS-001-2026',
    'Missão de Resgate',
    'Operação de resgate de animais abandonados',
    CURRENT_DATE - INTERVAL '10 days',
    'concluida',
    'alta',
    'e1a980f8-09ed-434e-b838-6a86fb2d24a6'::uuid
);

-- Inserir segunda missão
INSERT INTO public.missoes_2025_12_18_14_15 (
    id,
    codigo, 
    titulo, 
    descricao, 
    data_inicio, 
    status, 
    prioridade, 
    responsavel_id
) VALUES (
    gen_random_uuid(),
    'MISS-002-2026',
    'Campanha de Vacinação',
    'Vacinação antirrábica na comunidade',
    CURRENT_DATE - INTERVAL '5 days',
    'concluida',
    'media',
    'e1a980f8-09ed-434e-b838-6a86fb2d24a6'::uuid
);

-- Verificar se as missões foram inseridas
SELECT id, codigo, titulo, status FROM public.missoes_2025_12_18_14_15;

-- Inserir participações
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Coordenador',
    m.data_inicio,
    'Coordenação da missão'
FROM public.missoes_2025_12_18_14_15 m
WHERE m.codigo = 'MISS-001-2026';

INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Voluntário',
    m.data_inicio,
    'Apoio nas atividades'
FROM public.missoes_2025_12_18_14_15 m
WHERE m.codigo = 'MISS-002-2026';

-- Verificar resultado final
SELECT 
    p.funcao,
    p.data_participacao,
    m.titulo,
    m.status,
    m.prioridade
FROM public.participacoes_missoes_2025_12_29_07_00 p
JOIN public.missoes_2025_12_18_14_15 m ON p.missao_id = m.id
WHERE p.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;