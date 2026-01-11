-- Verificar estrutura da tabela localizacoes_animal
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
    AND table_schema = 'public'
ORDER BY ordinal_position;