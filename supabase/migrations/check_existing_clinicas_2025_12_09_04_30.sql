-- Verificar todas as tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar se existem colunas relacionadas com clínicas ou veterinários
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name ILIKE '%clinic%' OR column_name ILIKE '%veterinar%' OR column_name ILIKE '%vet%')
ORDER BY table_name, column_name;