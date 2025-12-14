-- Verificar se a tabela clinicas_veterinarias existe
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'clinicas_veterinarias' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela intervencoes
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
ORDER BY ordinal_position;

-- Verificar se há dados de exemplo
SELECT COUNT(*) as total_intervencoes FROM intervencoes;
SELECT COUNT(*) as total_clinicas FROM clinicas_veterinarias;
SELECT COUNT(*) as total_tipos FROM tipos_intervencoes;