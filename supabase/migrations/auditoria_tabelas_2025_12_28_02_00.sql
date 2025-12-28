-- ============================================
-- AUDITORIA: LISTAR TODAS AS TABELAS
-- Data: 2025-12-28 02:00
-- ============================================

SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size('public.'||t.tablename)) AS tamanho,
    COALESCE(s.n_live_tup, 0) as linhas
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname AND t.schemaname = s.schemaname
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||t.tablename) DESC;