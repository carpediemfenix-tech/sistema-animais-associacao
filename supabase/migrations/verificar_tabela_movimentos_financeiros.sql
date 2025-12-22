-- Verificar se existe tabela de movimentos financeiros
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%financeiro%' OR table_name LIKE '%movimento%';

-- Verificar estrutura se existir
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name LIKE '%financeiro%' OR table_name LIKE '%movimento%'
ORDER BY table_name, ordinal_position;