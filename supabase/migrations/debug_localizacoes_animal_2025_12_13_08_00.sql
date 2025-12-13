-- Verificar estrutura atual da tabela localizacoes_animal
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal'
ORDER BY ordinal_position;

-- Verificar se existe a coluna localizacao_id
SELECT COUNT(*) as tem_localizacao_id
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
AND column_name = 'localizacao_id';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'localizacoes_animal';