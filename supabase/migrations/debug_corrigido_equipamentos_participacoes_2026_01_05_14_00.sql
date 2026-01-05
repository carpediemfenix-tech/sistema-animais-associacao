-- Verificar equipamentos atribuídos ao voluntário
SELECT 
    a.id,
    a.voluntario_id,
    a.equipamento_id,
    a.estado as estado_atribuicao,
    a.ativo as atribuicao_ativa,
    a.data_atribuicao,
    e.numero_serie,
    e.estado as estado_equipamento,
    e.ativo as equipamento_ativo,
    t.nome as tipo_nome,
    c.nome as categoria_nome,
    c.cor as categoria_cor
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
LEFT JOIN public.equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
LEFT JOIN public.tipos_equipamentos_2025_12_13_01_00 t ON e.tipo_equipamento_id = t.id
LEFT JOIN public.categorias_equipamentos_2025_12_13_01_00 c ON t.categoria_id = c.id
WHERE a.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
ORDER BY a.data_atribuicao DESC;

-- Verificar participações do voluntário
SELECT 
    p.id,
    p.voluntario_id,
    p.missao_id,
    p.funcao,
    p.data_participacao,
    m.titulo,
    m.status,
    m.prioridade
FROM public.participacoes_missoes_2025_12_29_07_00 p
LEFT JOIN public.missoes_2025_12_18_14_15 m ON p.missao_id = m.id
WHERE p.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
ORDER BY p.data_participacao DESC;

-- Inserir participação se não existir
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (
    voluntario_id, 
    missao_id, 
    funcao, 
    data_participacao, 
    observacoes
)
SELECT 
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    m.id,
    'Coordenador',
    m.data_inicio,
    'Coordenação da missão'
FROM public.missoes_2025_12_18_14_15 m
WHERE NOT EXISTS (
    SELECT 1 FROM public.participacoes_missoes_2025_12_29_07_00 p2
    WHERE p2.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
    AND p2.missao_id = m.id
)
LIMIT 2;