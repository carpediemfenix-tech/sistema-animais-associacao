-- LIMPEZA COMPLETA SUPABASE - VERSÕES 201+ (Corrigida)
-- Remove estruturas obsoletas das versões < 200

-- 1. Remover funções obsoletas (se existirem)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_profile() CASCADE;

-- 2. Verificar integridade das tabelas principais
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

-- 3. Relatório de tabelas existentes
SELECT 
    'TABELAS ATIVAS' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. Relatório de políticas RLS ativas
SELECT 
    'POLÍTICAS RLS ATIVAS' as tipo,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;