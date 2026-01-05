-- Verificar se já existe atribuição de equipamento
SELECT COUNT(*) as total_atribuicoes 
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 
WHERE voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;

-- Criar equipamento se não existir
INSERT INTO public.equipamentos_2025_12_13_01_00 (
    numero_serie, 
    estado, 
    ativo, 
    localizacao,
    valor_aquisicao,
    tipo_equipamento_id
)
SELECT 
    'EPI001-TEST',
    'disponivel',
    true,
    'Armazém Principal',
    150.00,
    t.id
FROM public.tipos_equipamentos_2025_12_13_01_00 t
WHERE t.nome ILIKE '%proteção%' OR t.nome ILIKE '%epi%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Criar atribuição de equipamento
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
    CURRENT_DATE - INTERVAL '3 days',
    'ativo',
    true,
    'Equipamento de proteção individual para atividades de campo'
FROM public.equipamentos_2025_12_13_01_00 e
WHERE e.numero_serie = 'EPI001-TEST'
AND NOT EXISTS (
    SELECT 1 FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
    WHERE a.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
    AND a.equipamento_id = e.id
);

-- Verificar resultado
SELECT 
    a.id,
    a.data_atribuicao,
    a.estado,
    e.numero_serie,
    e.estado as estado_equipamento,
    t.nome as tipo_nome
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
JOIN public.equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
LEFT JOIN public.tipos_equipamentos_2025_12_13_01_00 t ON e.tipo_equipamento_id = t.id
WHERE a.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid;