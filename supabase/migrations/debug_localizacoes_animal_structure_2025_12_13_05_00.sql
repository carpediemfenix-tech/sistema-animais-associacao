-- Verificar estrutura atual da tabela localizacoes_animal
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal'
ORDER BY ordinal_position;

-- Verificar se existe coluna tipo_localizacao
SELECT COUNT(*) as tem_tipo_localizacao
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
AND column_name = 'tipo_localizacao';

-- Verificar se existe coluna localizacao_id
SELECT COUNT(*) as tem_localizacao_id
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
AND column_name = 'localizacao_id';

-- Verificar dados de exemplo
SELECT * FROM localizacoes_animal LIMIT 3;