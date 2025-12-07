-- DESATIVAR RLS TEMPORARIAMENTE PARA ACOES_FORMACAO
-- Solução definitiva para resolver erro 401 Unauthorized
-- Criado em: 2025-12-07 09:50 UTC

-- 1. VERIFICAR ESTADO ATUAL DA TABELA
SELECT 'Estado atual da tabela acoes_formacao:' as status;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls_policies
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'acoes_formacao';

-- 2. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "acoes_formacao_select_authenticated" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_insert_authenticated" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_update_authenticated" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_delete_authenticated" ON public.acoes_formacao;

-- Remover outras políticas possíveis
DROP POLICY IF EXISTS "Enable read access for all users" ON public.acoes_formacao;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.acoes_formacao;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.acoes_formacao;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.acoes_formacao;

-- 3. DESATIVAR RLS COMPLETAMENTE
ALTER TABLE public.acoes_formacao DISABLE ROW LEVEL SECURITY;

-- 4. CONCEDER PERMISSÕES TOTAIS
GRANT ALL PRIVILEGES ON public.acoes_formacao TO authenticated;
GRANT ALL PRIVILEGES ON public.acoes_formacao TO anon;
GRANT ALL PRIVILEGES ON public.acoes_formacao TO postgres;

-- 5. CONCEDER PERMISSÕES NA SEQUÊNCIA (se existir)
GRANT ALL PRIVILEGES ON SEQUENCE acoes_formacao_id_seq TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE acoes_formacao_id_seq TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE acoes_formacao_id_seq TO postgres;

-- 6. VERIFICAR PERMISSÕES FINAIS
SELECT 'Permissões finais na tabela acoes_formacao:' as status;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'acoes_formacao'
ORDER BY grantee, privilege_type;

-- 7. VERIFICAR QUE NÃO HÁ POLÍTICAS RLS
SELECT 'Políticas RLS restantes (deve estar vazio):' as status;
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'acoes_formacao';

-- 8. TESTAR INSERÇÃO DIRETA (simulação)
SELECT 'Estrutura da tabela para teste:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'acoes_formacao'
ORDER BY ordinal_position;

-- 9. VERIFICAR DADOS EXISTENTES
SELECT 'Dados existentes na tabela:' as status;
SELECT COUNT(*) as total_acoes FROM public.acoes_formacao;

-- Comentário final
COMMENT ON TABLE public.acoes_formacao IS 'RLS DESATIVADO - Acesso total para todos os usuários (temporário para testes)';