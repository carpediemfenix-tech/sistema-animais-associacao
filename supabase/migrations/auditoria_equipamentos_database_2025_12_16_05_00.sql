-- AUDITORIA COMPLETA DO MÓDULO EQUIPAMENTOS
-- Verificar todas as tabelas relacionadas a equipamentos

-- 1. Verificar se todas as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%equipamentos%' 
   OR table_name LIKE '%categorias_equipamentos%'
   OR table_name LIKE '%tipos_equipamentos%'
   OR table_name LIKE '%atribuicoes_equipamentos%'
   OR table_name LIKE '%manutencoes_equipamentos%'
   OR table_name LIKE '%alertas_reposicao%'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela principal de equipamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- 3. Verificar constraints e chaves estrangeiras
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'equipamentos_2025_12_13_01_00';

-- 4. Verificar dados de exemplo e integridade
SELECT 
    'equipamentos' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM equipamentos_2025_12_13_01_00
UNION ALL
SELECT 
    'categorias',
    COUNT(*),
    COUNT(CASE WHEN ativo = true THEN 1 END),
    COUNT(CASE WHEN ativo = false THEN 1 END)
FROM categorias_equipamentos_2025_12_13_01_00
UNION ALL
SELECT 
    'tipos',
    COUNT(*),
    COUNT(CASE WHEN ativo = true THEN 1 END),
    COUNT(CASE WHEN ativo = false THEN 1 END)
FROM tipos_equipamentos_2025_12_13_01_00;

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename LIKE '%equipamentos%' 
   OR tablename LIKE '%categorias_equipamentos%'
   OR tablename LIKE '%tipos_equipamentos%';

-- 6. Verificar se há dados órfãos ou inconsistências
SELECT 
    e.id,
    e.codigo_interno,
    e.tipo_equipamento_id,
    t.nome as tipo_nome,
    t.categoria_id,
    c.nome as categoria_nome
FROM equipamentos_2025_12_13_01_00 e
LEFT JOIN tipos_equipamentos_2025_12_13_01_00 t ON e.tipo_equipamento_id = t.id
LEFT JOIN categorias_equipamentos_2025_12_13_01_00 c ON t.categoria_id = c.id
WHERE t.id IS NULL OR c.id IS NULL
LIMIT 10;