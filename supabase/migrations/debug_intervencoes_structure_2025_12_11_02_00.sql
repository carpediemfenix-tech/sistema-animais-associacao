-- Verificar se a tabela intervencoes existe e sua estrutura
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'intervencoes'
ORDER BY ordinal_position;

-- Verificar dados de exemplo
SELECT COUNT(*) as total_intervencoes FROM intervencoes;

-- Verificar se há intervenções para algum animal específico
SELECT animal_id, COUNT(*) as total
FROM intervencoes 
GROUP BY animal_id 
ORDER BY total DESC 
LIMIT 5;