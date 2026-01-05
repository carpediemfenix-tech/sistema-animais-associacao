-- Verificar constraints da tabela
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.missoes_2025_12_18_14_15'::regclass;

-- Verificar dados existentes para entender os valores válidos
SELECT DISTINCT status FROM public.missoes_2025_12_18_14_15;
SELECT DISTINCT prioridade FROM public.missoes_2025_12_18_14_15;

-- Inserir com valores que já existem na tabela
INSERT INTO public.missoes_2025_12_18_14_15 (
    codigo, 
    titulo, 
    descricao, 
    data_inicio, 
    status, 
    prioridade, 
    local_principal,
    orcamento_previsto,
    responsavel_id
)
SELECT 
    'MISS-01-2026-004',
    'Campanha de Vacinação',
    'Campanha de vacinação antirrábica para animais da comunidade',
    CURRENT_DATE + INTERVAL '5 days',
    'rascunho',  -- Usando valor padrão
    'baixa',     -- Usando valor válido
    'Parque Municipal',
    300.00,
    v.id
FROM public.voluntarios v
WHERE v.ativo = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verificar se funcionou
SELECT id, codigo, titulo, status, prioridade FROM public.missoes_2025_12_18_14_15 
WHERE codigo = 'MISS-01-2026-004';