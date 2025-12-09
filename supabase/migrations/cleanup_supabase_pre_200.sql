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
        AND (policyname LIKE '%old%' OR policyname LIKE '%temp%')
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

-- 3. Verificar e remover tabelas obsoletas (CUIDADO - apenas se não estiverem em uso)
DO $$
DECLARE
    table_record RECORD;
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

-- 4. Otimizar tabelas principais
VACUUM ANALYZE public.animais;
VACUUM ANALYZE public.voluntarios;
VACUUM ANALYZE public.tipos_formacao;
VACUUM ANALYZE public.acoes_formacao;
VACUUM ANALYZE public.participacoes_formacao;
VACUUM ANALYZE public.movimentos_financeiros;

-- 5. Verificar integridade das tabelas principais
DO $$
BEGIN
    -- Verificar se todas as tabelas essenciais existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animais') THEN
        RAISE EXCEPTION 'Tabela essencial "animais" não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voluntarios') THEN
        RAISE EXCEPTION 'Tabela essencial "voluntarios" não encontrada!';
    END IF;
    
    RAISE NOTICE 'Verificação de integridade concluída com sucesso!';
END $$;

-- 6. Relatório final
SELECT 
    'LIMPEZA CONCLUÍDA' as status,
    COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public';