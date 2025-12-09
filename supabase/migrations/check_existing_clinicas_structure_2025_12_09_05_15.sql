-- Verificar se existe tabela de clínicas veterinárias
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name ILIKE '%clinic%' OR table_name ILIKE '%veterinar%')
ORDER BY table_name;

-- Verificar colunas relacionadas a clínicas em outras tabelas
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name ILIKE '%clinic%' OR column_name ILIKE '%veterinar%')
ORDER BY table_name, column_name;

-- Verificar estrutura da tabela intervencoes para ver referência a clínicas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'intervencoes'
ORDER BY ordinal_position;

-- Verificar se existe dados de clínicas nas intervenções
SELECT DISTINCT clinica 
FROM public.intervencoes 
WHERE clinica IS NOT NULL 
LIMIT 10;