-- Verificar todas as tabelas que contêm 'local' no nome
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%local%';

-- Verificar estrutura da tabela localizacoes se existir
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'localizacoes'
ORDER BY ordinal_position;

-- Verificar dados existentes na tabela
SELECT * FROM public.localizacoes LIMIT 5;