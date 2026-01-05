-- Verificar equipamentos existentes
SELECT id, numero_serie, estado, ativo FROM public.equipamentos_2025_12_13_01_00 
WHERE ativo = true 
LIMIT 5;

-- Criar atribuição usando primeiro equipamento disponível
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
    'Equipamento atribuído para atividades de campo'
FROM public.equipamentos_2025_12_13_01_00 e
WHERE e.ativo = true
AND NOT EXISTS (
    SELECT 1 FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
    WHERE a.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
    AND a.equipamento_id = e.id
    AND a.ativo = true
)
LIMIT 1;

-- Verificar se a atribuição foi criada
SELECT 
    a.id,
    a.data_atribuicao,
    a.estado,
    a.ativo,
    e.numero_serie,
    e.estado as estado_equipamento,
    e.ativo as equipamento_ativo
FROM public.atribuicoes_equipamentos_2025_12_13_01_00 a
JOIN public.equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
WHERE a.voluntario_id = 'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
AND a.ativo = true;