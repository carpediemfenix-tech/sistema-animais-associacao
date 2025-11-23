-- Verificar estrutura da tabela voluntarios
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voluntarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar restrições de chave estrangeira que referenciam voluntarios
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'voluntarios';

-- Verificar se há dados que referenciam voluntarios
SELECT 'intervencoes' as tabela, COUNT(*) as referencias
FROM public.intervencoes 
WHERE veterinario IS NOT NULL
UNION ALL
SELECT 'eventos' as tabela, COUNT(*) as referencias  
FROM public.eventos 
WHERE responsavel IS NOT NULL;

-- Listar alguns voluntários para teste
SELECT id, nome, especialidade, ativo 
FROM public.voluntarios 
ORDER BY nome 
LIMIT 5;