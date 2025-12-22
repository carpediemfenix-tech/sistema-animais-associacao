-- Verificar se tabela acoes_formacao existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'acoes_formacao'
ORDER BY ordinal_position;