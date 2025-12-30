-- Verificar todas as clínicas no sistema
SELECT 
    id,
    nome,
    endereco,
    telefone,
    email,
    responsavel_veterinario,
    ativo,
    created_at
FROM public.clinicas 
ORDER BY nome;

-- Contar clínicas ativas vs inativas
SELECT 
    ativo,
    COUNT(*) as total
FROM public.clinicas 
GROUP BY ativo;

-- Verificar se há clínicas de exemplo (criadas recentemente)
SELECT 
    'Clínicas criadas hoje' as tipo,
    COUNT(*) as total
FROM public.clinicas 
WHERE DATE(created_at) = CURRENT_DATE;