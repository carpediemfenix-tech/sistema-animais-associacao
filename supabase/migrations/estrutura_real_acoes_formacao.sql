-- Verificar estrutura real da tabela acoes_formacao
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'acoes_formacao'
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT * FROM acoes_formacao LIMIT 3;