-- Verificar se as tabelas existem e sua estrutura
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_name LIKE '%equipamento%'
ORDER BY t.table_name, c.ordinal_position;

-- Listar todas as tabelas que contêm 'equipamento' no nome
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%equipamento%'
ORDER BY table_name;