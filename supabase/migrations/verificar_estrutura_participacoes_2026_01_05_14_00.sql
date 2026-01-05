-- Verificar estrutura da tabela de participações
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existem dados na tabela
SELECT COUNT(*) as total FROM public.participacoes_missoes_2025_12_29_07_00;

-- Testar inserção simples com campos básicos
INSERT INTO public.participacoes_missoes_2025_12_29_07_00 (
    missao_id,
    voluntario_id,
    funcao,
    data_participacao,
    observacoes
) 
SELECT 
    m.id,
    'aadc2d3c-85a0-4168-86f5-dcb0c643cfc2'::uuid,
    'Teste RLS',
    CURRENT_DATE,
    'Teste de inserção para verificar RLS'
FROM public.missoes_2025_12_18_14_15 m
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    id,
    missao_id,
    voluntario_id,
    funcao,
    data_participacao
FROM public.participacoes_missoes_2025_12_29_07_00
WHERE funcao = 'Teste RLS';