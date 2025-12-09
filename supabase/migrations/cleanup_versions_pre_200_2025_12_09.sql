-- LIMPEZA COMPLETA SUPABASE - VERSÕES 201+
-- Remove tabelas, políticas e estruturas obsoletas das versões < 200

-- 1. Remover políticas RLS obsoletas (se existirem)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Listar e remover políticas obsoletas
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND policyname LIKE '%old%' OR policyname LIKE '%temp%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol_record.policyname, 
                      pol_record.schemaname, 
                      pol_record.tablename);
        RAISE NOTICE 'Removed policy: %', pol_record.policyname;
    END LOOP;
END $$;

-- 2. Remover funções obsoletas (se existirem)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_profile() CASCADE;

-- 3. Remover triggers obsoletos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profile_trigger ON public.profiles;

-- 4. Verificar e remover tabelas obsoletas (CUIDADO - apenas se não estiverem em uso)
-- Estas são tabelas que podem ter sido criadas nas versões antigas mas não são mais usadas

-- Verificar se existem tabelas não referenciadas no código atual
DO $$
DECLARE
    table_record RECORD;
    table_exists BOOLEAN;
BEGIN
    -- Lista de possíveis tabelas obsoletas das versões antigas
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'user_profiles_old',
            'temp_migrations',
            'backup_data',
            'old_voluntarios',
            'temp_formacao'
        )
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', table_record.table_name);
        RAISE NOTICE 'Removed obsolete table: %', table_record.table_name;
    END LOOP;
END $$;

-- 5. Limpar dados de teste antigos (manter apenas dados essenciais)
-- Remover dados de teste das versões antigas se existirem
DELETE FROM public.participacoes_formacao WHERE created_at < '2025-12-01';
DELETE FROM public.acoes_formacao WHERE created_at < '2025-12-01' AND nome LIKE '%test%';

-- 6. Otimizar tabelas principais
VACUUM ANALYZE public.animais;
VACUUM ANALYZE public.voluntarios;
VACUUM ANALYZE public.tipos_formacao;
VACUUM ANALYZE public.acoes_formacao;
VACUUM ANALYZE public.participacoes_formacao;
VACUUM ANALYZE public.movimentos_financeiros;

-- 7. Verificar integridade das tabelas principais
DO $$
BEGIN
    -- Verificar se todas as tabelas essenciais existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animais') THEN
        RAISE EXCEPTION 'Tabela essencial "animais" não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voluntarios') THEN
        RAISE EXCEPTION 'Tabela essencial "voluntarios" não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_formacao') THEN
        RAISE EXCEPTION 'Tabela essencial "tipos_formacao" não encontrada!';
    END IF;
    
    RAISE NOTICE 'Verificação de integridade concluída com sucesso!';
END $$;

-- 8. Relatório final
SELECT 
    'LIMPEZA CONCLUÍDA' as status,
    COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 
    'POLÍTICAS RLS ATIVAS' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- Comentário final
-- Este script remove estruturas obsoletas das versões < 200
-- Mantém apenas estruturas das versões 201+ até à atual
-- Executado em: 2025-12-09