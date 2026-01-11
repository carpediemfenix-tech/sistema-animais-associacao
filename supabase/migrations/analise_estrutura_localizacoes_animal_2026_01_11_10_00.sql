-- Verificar estrutura completa da tabela localizacoes_animal
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'localizacoes_animal'
) as tabela_existe;

-- Listar todas as tabelas relacionadas com localizacoes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%localiza%'
ORDER BY table_name;