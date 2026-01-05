-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00';

-- Verificar políticas atuais
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00';

-- Desabilitar RLS temporariamente para teste
ALTER TABLE public.participacoes_missoes_2025_12_29_07_00 DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00';

-- Testar inserção simples sem RLS
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (
    missao_id,
    voluntario_id,
    funcao,
    data_participacao,
    observacoes
) VALUES (
    'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Teste sem RLS',
    '2026-01-19'::date,
    'Teste de inserção sem RLS'
) ON CONFLICT DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    id,
    missao_id,
    voluntario_id,
    funcao,
    data_participacao
FROM public.participacoes_missoes_2025_12_29_07_00
WHERE funcao = 'Teste sem RLS';