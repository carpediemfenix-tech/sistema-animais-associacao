-- CORRIGIR POLÍTICAS RLS PARA ACOES_FORMACAO
-- Permitir inserções, atualizações e consultas para usuários autenticados
-- Criado em: 2025-12-07 09:45 UTC

-- 1. VERIFICAR POLÍTICAS ATUAIS
SELECT 'Políticas RLS atuais para acoes_formacao:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'acoes_formacao'
ORDER BY policyname;

-- 2. REMOVER POLÍTICAS RESTRITIVAS EXISTENTES
DROP POLICY IF EXISTS "acoes_formacao_select_policy" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_insert_policy" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_update_policy" ON public.acoes_formacao;
DROP POLICY IF EXISTS "acoes_formacao_delete_policy" ON public.acoes_formacao;

-- 3. CRIAR POLÍTICAS PERMISSIVAS PARA USUÁRIOS AUTENTICADOS
-- Política para SELECT (consultar)
CREATE POLICY "acoes_formacao_select_authenticated" ON public.acoes_formacao
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política para INSERT (criar)
CREATE POLICY "acoes_formacao_insert_authenticated" ON public.acoes_formacao
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (atualizar)
CREATE POLICY "acoes_formacao_update_authenticated" ON public.acoes_formacao
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE (eliminar)
CREATE POLICY "acoes_formacao_delete_authenticated" ON public.acoes_formacao
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 4. GARANTIR QUE RLS ESTÁ ATIVO
ALTER TABLE public.acoes_formacao ENABLE ROW LEVEL SECURITY;

-- 5. CONCEDER PERMISSÕES BÁSICAS
GRANT ALL ON public.acoes_formacao TO authenticated;
GRANT ALL ON public.acoes_formacao TO anon;

-- 6. VERIFICAR POLÍTICAS FINAIS
SELECT 'Políticas RLS finais para acoes_formacao:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'acoes_formacao'
ORDER BY policyname;

-- 7. TESTAR INSERÇÃO SIMPLES
SELECT 'Testando estrutura da tabela acoes_formacao:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'acoes_formacao'
AND column_name IN ('id', 'codigo_acao', 'tipo_formacao_id', 'nome_acao', 'status')
ORDER BY ordinal_position;

-- Comentário final
COMMENT ON TABLE public.acoes_formacao IS 'Políticas RLS corrigidas - permitir todas as operações para usuários autenticados';