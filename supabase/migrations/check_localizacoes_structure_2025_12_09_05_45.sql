-- Verificar se a tabela localizacoes existe e sua estrutura
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes';

-- Verificar estrutura da tabela localizacoes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;

-- Verificar se existe tabela localizacoes_animais
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%localizac%';

-- Verificar estrutura de tabelas relacionadas a localizações
SELECT column_name, data_type, table_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (table_name LIKE '%localizac%' OR column_name LIKE '%localizac%')
ORDER BY table_name, ordinal_position;