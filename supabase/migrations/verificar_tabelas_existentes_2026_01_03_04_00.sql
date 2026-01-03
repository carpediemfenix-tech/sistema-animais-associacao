-- =====================================================
-- VERIFICAÇÃO DAS TABELAS EXISTENTES NO SISTEMA
-- Sistema Valentão Operacionais v2.0
-- Data: 2026-01-03 04:00 UTC
-- =====================================================

-- Verificar tabelas existentes
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar se as tabelas principais existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animais') 
        THEN 'EXISTS' 
        ELSE 'NOT EXISTS' 
    END as tabela_animais,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'denuncias') 
        THEN 'EXISTS' 
        ELSE 'NOT EXISTS' 
    END as tabela_denuncias,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') 
        THEN 'EXISTS' 
        ELSE 'NOT EXISTS' 
    END as tabela_notificacoes,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'utilizadores') 
        THEN 'EXISTS' 
        ELSE 'NOT EXISTS' 
    END as tabela_utilizadores;