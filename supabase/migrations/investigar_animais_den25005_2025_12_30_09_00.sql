-- Verificar se os animais DEN25005 foram criados
SELECT 
    'Animais DEN25005' as info,
    id,
    nome,
    estado,
    local_encontrado,
    data_entrada,
    responsavel_id,
    created_at
FROM public.animais 
WHERE nome LIKE 'DEN25005%'
ORDER BY nome;

-- Verificar todos os animais criados hoje
SELECT 
    'Animais criados hoje' as info,
    COUNT(*) as total
FROM public.animais 
WHERE DATE(created_at) = CURRENT_DATE;

-- Verificar últimos 10 animais criados
SELECT 
    'Últimos animais criados' as info,
    id,
    nome,
    estado,
    data_entrada,
    created_at
FROM public.animais 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar se a missão MIS-DEN25005 foi criada
SELECT 
    'Missão DEN25005' as info,
    id,
    codigo,
    titulo,
    status,
    responsavel_id,
    created_at
FROM public.missoes_2025_12_29_07_00 
WHERE codigo LIKE '%DEN25005%'
ORDER BY created_at DESC;

-- Verificar participações da missão
SELECT 
    'Participações MIS-DEN25005' as info,
    p.id,
    p.missao_id,
    p.voluntario_id,
    p.funcao,
    v.nome as voluntario_nome
FROM public.participacoes_missoes_2025_12_29_07_00 p
LEFT JOIN public.voluntarios v ON p.voluntario_id = v.id
WHERE p.missao_id IN (
    SELECT id FROM public.missoes_2025_12_29_07_00 
    WHERE codigo LIKE '%DEN25005%'
);