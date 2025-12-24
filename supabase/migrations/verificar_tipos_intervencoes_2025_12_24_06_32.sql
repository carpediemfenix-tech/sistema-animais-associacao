-- Verificar estrutura da tabela tipos_intervencoes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tipos_intervencoes' 
ORDER BY ordinal_position;