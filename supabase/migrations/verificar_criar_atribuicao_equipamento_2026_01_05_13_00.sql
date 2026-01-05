-- Verificar qual é o ID real do Jorge António
SELECT id, nome, email FROM public.voluntarios 
WHERE nome ILIKE '%jorge%' OR email ILIKE '%jorge%'
ORDER BY nome;

-- Verificar se existe equipamento EPI001
SELECT id, numero_serie, estado, ativo FROM public.equipamentos_2025_12_13_01_00 
WHERE numero_serie = 'EPI001' OR numero_serie ILIKE '%EPI001%';

-- Verificar atribuições existentes
SELECT 
    a.id,
    a.voluntario_id,
    a.equipamento_id,
    a.estado,
    a.ativo,
    v.nome as voluntario_nome,
    e.numero_serie
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
JOIN public.voluntarios v ON a.voluntario_id = v.id
JOIN public.equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
WHERE e.numero_serie = 'EPI001' OR v.nome ILIKE '%jorge%'
ORDER BY a.data_atribuicao DESC;

-- Se o Jorge António for o ID aadc2d3c-85a0-4168-86f5-dcb0c643cfc2, criar atribuição
INSERT INTO public.atribuicoes_equipamentos_2025_12_13_01_00 (
    voluntario_id, 
    equipamento_id, 
    data_atribuicao, 
    estado, 
    ativo,
    observacoes
)
SELECT 
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    e.id,
    CURRENT_DATE - INTERVAL '5 days',
    'ativo',
    true,
    'Equipamento de proteção individual atribuído para atividades de campo'
FROM public.equipamentos_2025_12_13_01_00 e
WHERE e.numero_serie = 'EPI001'
AND NOT EXISTS (
    SELECT 1 FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a2
    WHERE a2.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
    AND a2.equipamento_id = e.id
    AND a2.ativo = true
);

-- Verificar resultado
SELECT 
    a.id,
    a.voluntario_id,
    a.data_atribuicao,
    a.estado,
    v.nome as voluntario_nome,
    e.numero_serie,
    e.estado as estado_equipamento
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
JOIN public.voluntarios v ON a.voluntario_id = v.id
JOIN public.equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
WHERE a.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
AND a.ativo = true;