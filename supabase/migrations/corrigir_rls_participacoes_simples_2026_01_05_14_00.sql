-- Verificar políticas RLS existentes na tabela de participações
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00';

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00';

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Permitir leitura de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "Permitir inserção de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "Permitir atualização de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;
DROP POLICY IF EXISTS "Permitir exclusão de participações para usuários autenticados" ON public.participacoes_missoes_2025_12_29_07_00;

-- Criar políticas RLS mais permissivas para usuários autenticados
CREATE POLICY "participacoes_select_policy" ON public.participacoes_missoes_2025_12_29_07_00
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "participacoes_insert_policy" ON public.participacoes_missoes_2025_12_29_07_00
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "participacoes_update_policy" ON public.participacoes_missoes_2025_12_29_07_00
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "participacoes_delete_policy" ON public.participacoes_missoes_2025_12_29_07_00
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00';

-- Testar inserção com dados de exemplo
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (
    missao_id,
    voluntario_id,
    funcao,
    data_participacao,
    observacoes
) VALUES (
    'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Teste',
    CURRENT_DATE,
    'Teste de inserção após correção RLS'
) ON CONFLICT DO NOTHING;