-- Verificar todas as tabelas que existem na base de dados
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%especialidades%'
ORDER BY table_name;