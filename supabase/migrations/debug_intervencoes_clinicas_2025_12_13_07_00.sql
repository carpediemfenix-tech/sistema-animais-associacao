-- Verificar estrutura da tabela intervencoes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'intervencoes'
ORDER BY ordinal_position;

-- Verificar se existe coluna clinica_id
SELECT COUNT(*) as tem_clinica_id
FROM information_schema.columns 
WHERE table_name = 'intervencoes' 
AND column_name = 'clinica_id';

-- Verificar dados de exemplo
SELECT id, animal_id, clinica, clinica_id, veterinario
FROM intervencoes 
LIMIT 5;