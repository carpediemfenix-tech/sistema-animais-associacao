-- ============================================
-- AUDITORIA COMPLETA DO SUPABASE
-- Data: 2025-12-28 02:00
-- Objetivo: Identificar estrutura atual do banco
-- ============================================

-- 1. LISTAR TODAS AS TABELAS COM TAMANHO
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho,
    n_live_tup as linhas
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. LISTAR TODAS AS FUNÇÕES
SELECT 
    n.nspname as schema,
    p.proname as nome_funcao,
    pg_get_function_identity_arguments(p.oid) as argumentos
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 3. LISTAR TODOS OS TRIGGERS
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. LISTAR POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. VERIFICAR TABELAS VAZIAS OU COM POUCOS DADOS
SELECT 
    schemaname,
    tablename,
    n_live_tup as linhas,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_live_tup < 5
ORDER BY tablename;