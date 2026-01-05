-- Verificar missões existentes
SELECT id, codigo, titulo, status, prioridade, data_inicio 
FROM public.missoes_2025_12_18_14_15 
LIMIT 10;

-- Inserir participações usando missões existentes
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Coordenador' as funcao,
    COALESCE(m.data_inicio, CURRENT_DATE) as data_participacao,
    'Responsável pela coordenação geral da missão' as observacoes
FROM public.missoes_2025_12_18_14_15 m
LIMIT 2
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

-- Inserir mais participações com funções diferentes
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (missao_id, voluntario_id, funcao, data_participacao, observacoes)
SELECT 
    m.id as missao_id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid as voluntario_id,
    'Voluntário' as funcao,
    COALESCE(m.data_inicio, CURRENT_DATE) as data_participacao,
    'Apoio nas atividades de campo e transporte de animais' as observacoes
FROM public.missoes_2025_12_18_14_15 m
WHERE m.id NOT IN (
    SELECT missao_id FROM public.participacoes_missoes_2025_12_29_07_00 
    WHERE voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
)
LIMIT 1
ON CONFLICT (missao_id, voluntario_id) DO NOTHING;

-- Verificar se as participações foram criadas
SELECT 
    p.id,
    p.voluntario_id,
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