-- Verificar estrutura da tabela de participações
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela de missões
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_18_14_15'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar foreign keys entre as tabelas
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name = 'participacoes_missoes_2025_12_29_07_00' OR tc.table_name = 'missoes_2025_12_18_14_15');

-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name = 'participacoes_missoes_2025_12_29_07_00' OR table_name = 'missoes_2025_12_18_14_15')
ORDER BY table_name;