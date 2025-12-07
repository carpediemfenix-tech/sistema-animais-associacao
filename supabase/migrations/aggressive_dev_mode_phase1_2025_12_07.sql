-- MODO DESENVOLVIMENTO AGRESSIVO - DESATIVAR TODAS AS RESTRIÇÕES RLS
-- Acesso total para máxima eficiência de desenvolvimento
-- Criado em: 2025-12-07 10:05 UTC

-- ========================================
-- FASE 1: DESATIVAR RLS EM TODAS AS TABELAS
-- ========================================

-- 1. DESATIVAR RLS EM TODAS AS TABELAS PRINCIPAIS
ALTER TABLE IF EXISTS public.animais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.voluntarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipos_formacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.acoes_formacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.participacoes_formacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.intervencoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.movimentos_financeiros DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.especies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sexos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grupos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.localizacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.responsabilidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.responsabilidades_voluntarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias_financeiras DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lembretes DISABLE ROW LEVEL SECURITY;

-- 2. CONCEDER PERMISSÕES TOTAIS EM TODAS AS TABELAS E SEQUÊNCIAS
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 3. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DO $$
DECLARE
    r RECORD;
    policy_name TEXT;
BEGIN
    -- Lista de nomes de políticas comuns para remover
    FOR r IN (SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Políticas padrão do Supabase
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 'Enable read access for all users', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 'Enable insert for authenticated users only', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 'Enable update for users based on email', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 'Enable delete for users based on email', r.schemaname, r.tablename);
        
        -- Políticas personalizadas
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_select_policy', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_insert_policy', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_update_policy', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_delete_policy', r.schemaname, r.tablename);
        
        -- Políticas com sufixo _authenticated
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_select_authenticated', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_insert_authenticated', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_update_authenticated', r.schemaname, r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.tablename || '_delete_authenticated', r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE '🧹 Todas as políticas RLS removidas de todas as tabelas';
END $$;

-- 4. VERIFICAR RESULTADO - DEVE SER 0 POLÍTICAS
SELECT '📊 Políticas RLS restantes (deve ser 0):' as status;
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- 5. VERIFICAR TABELAS SEM RLS
SELECT '✅ Status RLS das tabelas principais:' as status;
SELECT 
    t.tablename,
    CASE WHEN t.rowsecurity THEN '❌ RLS ATIVO' ELSE '✅ RLS DESATIVADO' END as status_rls
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.tablename IN ('animais', 'voluntarios', 'tipos_formacao', 'acoes_formacao', 'intervencoes', 'movimentos_financeiros')
ORDER BY t.tablename;

-- 6. COMENTÁRIO FINAL NO SCHEMA
COMMENT ON SCHEMA public IS '🚀 MODO DESENVOLVIMENTO AGRESSIVO - RLS desativado em todas as tabelas, acesso total após login básico';

-- 7. RESULTADO FINAL
SELECT '🎉 FASE 1 COMPLETA - Base de dados configurada para desenvolvimento agressivo!' as resultado;
SELECT '⚡ Todas as tabelas agora têm acesso total para usuários autenticados' as info;
SELECT '🔓 Sem restrições RLS - máxima eficiência de desenvolvimento' as beneficio;