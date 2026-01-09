-- Verificar estrutura da tabela intake_config_options
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'intake_config_options' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'intake_config_options'
) as table_exists;

-- Se não existir, verificar tabelas relacionadas com intake
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%intake%'
ORDER BY table_name;