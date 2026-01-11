-- Verificar a estrutura da tabela eventos_animal
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
AND table_schema = 'public'
ORDER BY ordinal_position;