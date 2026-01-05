-- Verificar políticas RLS atuais
SELECT 
    'participacoes' as tabela,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'participacoes_missoes_2025_12_29_07_00'
UNION ALL
SELECT 
    'missoes' as tabela,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'missoes_2025_12_18_14_15'
ORDER BY tabela, cmd;

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('participacoes_missoes_2025_12_29_07_00', 'missoes_2025_12_18_14_15');

-- Verificar se a missão específica existe (sem tentar criar)
SELECT id, titulo, status FROM public.missoes_2025_12_18_14_15 
WHERE id = 'c3bc3dc7-281f-4cfb-b310-d14a4007da5e'::uuid;

-- Verificar se existem missões na tabela
SELECT COUNT(*) as total_missoes FROM public.missoes_2025_12_18_14_15;

-- Testar se as políticas RLS estão funcionando
-- (Esta query deve funcionar se as políticas estiverem corretas)
SELECT COUNT(*) as total_participacoes FROM public.participacoes_missoes_2025_12_29_07_00;