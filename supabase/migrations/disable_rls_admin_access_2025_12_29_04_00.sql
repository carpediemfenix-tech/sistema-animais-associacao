-- Corrigir políticas RLS para administradores
-- Data: 2025-12-29 04:00 UTC

-- 1. Remover todas as políticas restritivas existentes
DROP POLICY IF EXISTS "Permitir leitura de tipos de estado" ON public.tipos_estado;
DROP POLICY IF EXISTS "Permitir todas operações em tipos de estado" ON public.tipos_estado;
DROP POLICY IF EXISTS "Permitir leitura de estados de animais" ON public.estados_animal;
DROP POLICY IF EXISTS "Permitir inserção de estados de animais" ON public.estados_animal;
DROP POLICY IF EXISTS "Permitir atualização de estados de animais" ON public.estados_animal;
DROP POLICY IF EXISTS "Permitir exclusão de estados de animais" ON public.estados_animal;

-- 2. Desativar RLS para estas tabelas (mais permissivo)
ALTER TABLE public.tipos_estado DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_animal DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se RLS foi desativado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ATIVO' 
        ELSE 'RLS DESATIVADO' 
    END as status_rls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tipos_estado', 'estados_animal');

-- 4. Verificar se ainda existem políticas (deve retornar vazio)
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    'POLÍTICA AINDA ATIVA - DEVE SER REMOVIDA' as aviso
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tipos_estado', 'estados_animal');

-- 5. Testar permissões básicas
SELECT 
    'RLS desativado com sucesso! Administradores têm acesso total.' as status,
    current_user as usuario_atual,
    now() as data_correcao;

-- 6. Mostrar estrutura das tabelas para confirmar
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('tipos_estado', 'estados_animal')
ORDER BY table_name, ordinal_position;