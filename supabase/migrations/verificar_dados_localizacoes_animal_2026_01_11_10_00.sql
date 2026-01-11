-- Verificar dados existentes na tabela localizacoes_animal
SELECT * FROM localizacoes_animal LIMIT 5;

-- Contar registos
SELECT COUNT(*) as total_registos FROM localizacoes_animal;

-- Verificar estrutura através de uma query DESCRIBE-like
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'localizacoes_animal'
ORDER BY ordinal_position;