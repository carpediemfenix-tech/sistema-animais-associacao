-- Verificar se a coluna localizacao_id existe e seu tipo
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
AND column_name = 'localizacao_id';

-- Verificar se existe foreign key para localizacoes
SELECT 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'localizacoes_animal'
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'localizacao_id';

-- Verificar dados na tabela localizacoes
SELECT id, nome FROM localizacoes LIMIT 5;