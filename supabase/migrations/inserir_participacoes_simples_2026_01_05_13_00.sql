-- Verificar se já existem participações para este voluntário
SELECT COUNT(*) as participacoes_existentes 
FROM public.participacoes_missoes_2025_12_29_07_00 
WHERE voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;

-- Verificar missões disponíveis
SELECT COUNT(*) as total_missoes FROM public.missoes_2025_12_18_14_15;

-- Inserir participações simples
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Coordenador' as funcao,
    COALESCE(m.data_inicio, CURRENT_DATE) as data_participacao,
    'Responsável pela coordenação geral da missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
WHERE NOT EXISTS (
    SELECT 1 FROM public.participacoes_missoes_2025_12_29_07_00 p 
    WHERE p.missao_id = m.id AND p.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
)
LIMIT 3;

-- Verificar resultado
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