-- Verificar políticas RLS existentes na tabela de missões
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'missoes_2025_12_18_14_15';

-- Remover políticas restritivas existentes da tabela de missões
DROP POLICY IF EXISTS "Permitir leitura de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir inserção de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir atualização de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir exclusão de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;

-- Criar políticas RLS consistentes para missões
CREATE POLICY "missoes_select_policy" ON public.missoes_2025_12_18_14_15
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "missoes_insert_policy" ON public.missoes_2025_12_18_14_15
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "missoes_update_policy" ON public.missoes_2025_12_18_14_15
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "missoes_delete_policy" ON public.missoes_2025_12_18_14_15
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se a missão específica existe
SELECT id, titulo, status FROM public.missoes_2025_12_18_14_15 
WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid;

-- Se não existir, criar uma missão de teste
INSERT INTO public.missoes_2025_12_18_14_15 (
    id,
    codigo,
    titulo,
    descricao,
    data_inicio,
    status,
    prioridade,
    responsavel_id
) VALUES (
    'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid,
    'MISS-TEST-2026',
    'Missão de Teste',
    'Missão criada para testar participações',
    CURRENT_DATE,
    'ativa',
    'media',
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Verificar políticas finais
SELECT 
    'participacoes' as tabela,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00'
UNION ALL
SELECT 
    'missoes' as tabela,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'missoes_2025_12_18_14_15'
ORDER BY tabela, cmd;