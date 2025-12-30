-- Verificar todas as clínicas no sistema
SELECT 
    id,
    nome,
    endereco,
    telefone,
    responsavel_veterinario,
    ativo,
    created_at
FROM public.clinicas 
ORDER BY ativo DESC, nome;

-- Contar clínicas
SELECT 
    'Clínicas no sistema' as status,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE ativo = true) as ativas,
    COUNT(*) FILTER (WHERE ativo = false) as inativas
FROM public.clinicas;