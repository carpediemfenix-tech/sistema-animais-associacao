-- Verificar espécies disponíveis
SELECT 
    'Espécies disponíveis' as info,
    id,
    nome
FROM public.especies 
WHERE ativo = true
LIMIT 5;

-- Criar animal de teste com espécie
INSERT INTO public.animais (
    nome,
    especie,
    estado,
    local_encontrado,
    data_entrada,
    ativo
) VALUES (
    'TESTE-WIZARD-ANIMAL02',
    'Cão', -- Usar espécie comum
    'Em Resgate',
    'Local de Teste',
    CURRENT_DATE,
    true
) RETURNING id, nome, especie, estado;

-- Verificar se foi criado
SELECT 
    'Animal de teste criado' as info,
    id,
    nome,
    especie,
    estado,
    local_encontrado,
    data_entrada,
    created_at
FROM public.animais 
WHERE nome LIKE 'TESTE-WIZARD%'
ORDER BY created_at DESC;