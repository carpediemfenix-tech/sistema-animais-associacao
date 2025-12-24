-- Verificar estrutura da tabela intervencoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
ORDER BY ordinal_position;