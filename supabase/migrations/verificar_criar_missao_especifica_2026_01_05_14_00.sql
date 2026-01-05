-- Verificar se a missão específica existe
SELECT 
    id, 
    codigo, 
    titulo, 
    status, 
    prioridade,
    data_inicio
FROM public.missoes_2025_12_18_14_15 
WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid;

-- Verificar todas as missões disponíveis
SELECT 
    id, 
    codigo, 
    titulo, 
    status
FROM public.missoes_2025_12_18_14_15 
ORDER BY created_at DESC
LIMIT 5;

-- Se a missão não existir, criar uma com o ID específico
INSERT INTO public.missoes_2025_12_18_14_15 (
    id,
    codigo,
    titulo,
    descricao,
    data_inicio,
    status,
    prioridade,
    responsavel_id
) 
SELECT 
    'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid,
    'MISS-TESTE-' || EXTRACT(DAY FROM CURRENT_DATE),
    'Missão de Teste para Participações',
    'Missão criada especificamente para testar participações',
    CURRENT_DATE,
    (SELECT DISTINCT status FROM public.missoes_2025_12_18_14_15 LIMIT 1),
    (SELECT DISTINCT prioridade FROM public.missoes_2025_12_18_14_15 LIMIT 1),
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
WHERE NOT EXISTS (
    SELECT 1 FROM public.missoes_2025_12_18_14_15 
    WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid
);

-- Verificar se foi criada
SELECT 
    id, 
    codigo, 
    titulo, 
    status, 
    prioridade
FROM public.missoes_2025_12_18_14_15 
WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid;