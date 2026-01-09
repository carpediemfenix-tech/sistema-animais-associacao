-- Verificar estrutura atual das tabelas de admissão

-- 1. Verificar se tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%intake%' OR table_name LIKE '%admiss%')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela animal_intake_assessments se existir
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar dados existentes se a tabela existir
SELECT COUNT(*) as total_fichas_admissao
FROM animal_intake_assessments
WHERE true; -- Usar WHERE true para evitar erro se tabela não existir

-- 4. Verificar funções RPC relacionadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%intake%'
ORDER BY routine_name;