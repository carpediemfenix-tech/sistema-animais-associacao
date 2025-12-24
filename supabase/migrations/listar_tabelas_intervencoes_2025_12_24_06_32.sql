-- Listar todas as tabelas que contêm 'intervenc' no nome
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%intervenc%'
ORDER BY table_name;