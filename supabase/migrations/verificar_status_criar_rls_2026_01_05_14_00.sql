-- Verificar constraint de status
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.missoes_2025_12_18_14_15'::regclass
AND contype = 'c';

-- Verificar valores de status existentes
SELECT DISTINCT status FROM public.missoes_2025_12_18_14_15 LIMIT 10;

-- Remover políticas restritivas existentes da tabela de missões
DROP POLICY IF EXISTS "Permitir leitura de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir inserção de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;
DROP POLICY IF EXISTS "Permitir atualização de missões para usuários autenticados" ON public.missoes_2025_12_18_14_15;

-- Criar políticas RLS consistentes para missões
CREATE POLICY "missoes_select_policy" ON public.missoes_2025_12_18_14_15
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "missoes_insert_policy" ON public.missoes_2025_12_18_14_15
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "missoes_update_policy" ON public.missoes_2025_12_18_14_15
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Verificar se a missão específica existe
SELECT id, titulo, status FROM public.missoes_2025_12_18_14_15 
WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid;

-- Criar missão com status válido se não existir
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
    'rascunho',  -- Usando status padrão
    'baixa',     -- Usando prioridade válida
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Verificar se foi criada
SELECT id, codigo, titulo, status, prioridade FROM public.missoes_2025_12_18_14_15 
WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid;