-- Verificar todos os dados na tabela
SELECT 
    animal_id,
    nome,
    data_inicio,
    data_fim,
    ativo,
    motivo_alteracao
FROM public.historico_nomes_animais 
ORDER BY animal_id, data_inicio;

-- Verificar especificamente para o animal de teste
SELECT 
    'Dados para animal específico' as status,
    COUNT(*) as total_registos
FROM public.historico_nomes_animais 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid;

-- Verificar se o animal existe na tabela animais
SELECT 
    'Animal existe' as status,
    id,
    nome,
    especie
FROM public.animais 
WHERE id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid;