-- Verificar dados do voluntário Jorge António
SELECT id, nome, email FROM public.voluntarios 
WHERE nome ILIKE '%jorge%' OR nome ILIKE '%antónio%' OR nome ILIKE '%antonio%'
ORDER BY nome;

-- Verificar equipamentos atribuídos ao Jorge António
SELECT 
    a.id as atribuicao_id,
    a.voluntario_id,
    a.equipamento_id,
    a.data_atribuicao,
    a.estado as estado_atribuicao,
    a.ativo as atribuicao_ativa,
    e.numero_serie,
    e.estado as estado_equipamento,
    e.ativo as equipamento_ativo,
    v.nome as voluntario_nome
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
JOIN public.equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
JOIN public.voluntarios v ON a.voluntario_id = v.id
WHERE v.nome ILIKE '%jorge%' OR v.nome ILIKE '%antónio%' OR v.nome ILIKE '%antonio%'
ORDER BY a.data_atribuicao DESC;

-- Verificar se o ID aadc2d3c-85a0-4168-86f5-dcb0c643cfc2 corresponde ao Jorge António
SELECT id, nome, email FROM public.voluntarios 
WHERE id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;