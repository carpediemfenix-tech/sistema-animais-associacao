-- Verificar se existem tabelas relacionadas a equipamentos
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%equipamento%'
ORDER BY table_name;

-- Verificar se existem tabelas relacionadas a equipment
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%equipment%'
ORDER BY table_name;