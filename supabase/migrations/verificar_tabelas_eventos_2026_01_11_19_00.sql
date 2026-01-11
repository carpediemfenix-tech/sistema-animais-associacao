-- Primeiro, verificar se a tabela eventos_animal existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'eventos_animal' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Se não existir, vamos verificar se existe com outro nome
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%evento%';

-- Verificar também se existe tabela tipos_eventos
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%tipo%';