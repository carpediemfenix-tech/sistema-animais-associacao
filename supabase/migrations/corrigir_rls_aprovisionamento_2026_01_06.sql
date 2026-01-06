-- =====================================================
-- CORREÇÃO DE POLÍTICAS RLS E VERIFICAÇÃO DE DADOS
-- =====================================================

-- Verificar se as tabelas existem e têm dados
SELECT 'categorias_aprovisionamento_2026_01_06' as tabela, COUNT(*) as total FROM public.categorias_aprovisionamento_2026_01_06;
SELECT 'tipos_aprovisionamento_2026_01_06' as tabela, COUNT(*) as total FROM public.tipos_aprovisionamento_2026_01_06;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON public.categorias_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON public.tipos_aprovisionamento_2026_01_06;

-- Criar políticas RLS mais permissivas e específicas
-- Políticas para categorias_aprovisionamento_2026_01_06
CREATE POLICY "categorias_select_authenticated" ON public.categorias_aprovisionamento_2026_01_06
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categorias_insert_authenticated" ON public.categorias_aprovisionamento_2026_01_06
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categorias_update_authenticated" ON public.categorias_aprovisionamento_2026_01_06
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categorias_delete_authenticated" ON public.categorias_aprovisionamento_2026_01_06
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tipos_aprovisionamento_2026_01_06
CREATE POLICY "tipos_select_authenticated" ON public.tipos_aprovisionamento_2026_01_06
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tipos_insert_authenticated" ON public.tipos_aprovisionamento_2026_01_06
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tipos_update_authenticated" ON public.tipos_aprovisionamento_2026_01_06
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tipos_delete_authenticated" ON public.tipos_aprovisionamento_2026_01_06
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('categorias_aprovisionamento_2026_01_06', 'tipos_aprovisionamento_2026_01_06');

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('categorias_aprovisionamento_2026_01_06', 'tipos_aprovisionamento_2026_01_06');

-- Verificar dados existentes
SELECT id, nome, ativo, created_at FROM public.categorias_aprovisionamento_2026_01_06 ORDER BY nome;

-- Contar tipos por categoria
SELECT 
    c.nome as categoria,
    COUNT(t.id) as total_tipos
FROM public.categorias_aprovisionamento_2026_01_06 c
LEFT JOIN public.tipos_aprovisionamento_2026_01_06 t ON c.id = t.categoria_id
GROUP BY c.id, c.nome
ORDER BY c.nome;