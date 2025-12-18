-- Verificar se a base de dados atende todos os requisitos
-- Criada em: 2025-12-18 14:30 UTC

-- 1. Verificar tabelas criadas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE '%2025_12_18_14_15%'
ORDER BY table_name;

-- 2. Verificar tipos de missões inseridos
SELECT codigo, nome, categoria, pontos_base, requer_equipamentos 
FROM tipos_missoes_2025_12_18_14_15 
ORDER BY categoria, codigo;

-- 3. Testar relacionamentos críticos
SELECT 
    'missoes -> tipos_missoes' as relacionamento,
    COUNT(*) as tabelas_relacionadas
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'missoes_2025_12_18_14_15'
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.referenced_table_name = 'tipos_missoes_2025_12_18_14_15'

UNION ALL

SELECT 
    'participacoes -> voluntarios' as relacionamento,
    COUNT(*) as tabelas_relacionadas
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'participacoes_missoes_2025_12_18_14_15'
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.referenced_table_name = 'voluntarios'

UNION ALL

SELECT 
    'missoes_equipamentos -> equipamentos' as relacionamento,
    COUNT(*) as tabelas_relacionadas
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'missoes_equipamentos_2025_12_18_14_15'
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.referenced_table_name = 'equipamentos_2025_12_13_01_00';

-- 4. Verificar campos essenciais para todos os requisitos
SELECT 
    'Campos para Estados' as categoria,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'missoes_2025_12_18_14_15' 
        AND column_name = 'status'
    ) THEN '✅ Status existe' ELSE '❌ Status falta' END as verificacao

UNION ALL

SELECT 
    'Campos para Pontos' as categoria,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'voluntarios_pontos_2025_12_18_14_15' 
        AND column_name = 'pontos'
    ) THEN '✅ Sistema pontos existe' ELSE '❌ Sistema pontos falta' END as verificacao

UNION ALL

SELECT 
    'Campos para Relatório' as categoria,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'missoes_2025_12_18_14_15' 
        AND column_name = 'relatorio'
    ) THEN '✅ Campo relatório existe' ELSE '❌ Campo relatório falta' END as verificacao

UNION ALL

SELECT 
    'Campos Financeiros' as categoria,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'missoes_financeiro_2025_12_18_14_15'
    ) THEN '✅ Controle financeiro existe' ELSE '❌ Controle financeiro falta' END as verificacao;