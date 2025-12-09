-- Verificar constraints da tabela voluntarios
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.voluntarios'::regclass
AND contype = 'c';

-- Verificar estrutura da coluna especialidade
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
AND column_name = 'especialidade';