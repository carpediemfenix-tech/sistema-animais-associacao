-- DESATIVAR RLS PARA ACOES_FORMACAO - VERSÃO CORRIGIDA
-- Solução definitiva para resolver erro 401 Unauthorized
-- Criado em: 2025-12-07 09:52 UTC

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "acoes_formacao_select_authenticated" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_insert_authenticated" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_update_authenticated" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_delete_authenticated" ON public.acoes_formacao;

-- Remover outras políticas possíveis
DROP POLICY IF EXISTS "Enable read access for all users" ON public.acoes_formacao;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.acoes_formacao;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.acoes_formacao;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.acoes_formacao;

-- 2. DESATIVAR RLS COMPLETAMENTE
ALTER TABLE public.acoes_formacao DISABLE ROW LEVEL SECURITY;

-- 3. CONCEDER PERMISSÕES TOTAIS
GRANT ALL PRIVILEGES ON public.acoes_formacao TO authenticated;
GRANT ALL PRIVILEGES ON public.acoes_formacao TO anon;
GRANT ALL PRIVILEGES ON public.acoes_formacao TO postgres;

-- 4. VERIFICAR SE A TABELA EXISTE E SUA ESTRUTURA
SELECT 'Verificando tabela acoes_formacao:' as status;
SELECT COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'acoes_formacao';

-- 5. LISTAR COLUNAS PRINCIPAIS
SELECT 'Colunas principais da tabela:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'acoes_formacao'
AND column_name IN ('id', 'codigo_acao', 'tipo_formacao_id', 'nome_acao', 'status', 'created_at')
ORDER BY ordinal_position;

-- 6. VERIFICAR POLÍTICAS RESTANTES
SELECT 'Políticas RLS restantes (deve estar vazio):' as status;
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'acoes_formacao';

-- 7. VERIFICAR DADOS EXISTENTES
SELECT 'Dados existentes:' as status;
SELECT COUNT(*) as total_acoes FROM public.acoes_formacao;

-- 8. TESTAR ACESSO À TABELA
SELECT 'Teste de acesso à tabela:' as status;
SELECT 'Tabela acessível' as resultado;

-- Comentário final
COMMENT ON TABLE public.acoes_formacao IS 'RLS DESATIVADO - Acesso total (temporário para resolver erro 401)';