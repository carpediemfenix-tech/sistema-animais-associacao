-- 🔍 EKO: DIAGNÓSTICO COMPLETO DAS CATEGORIAS FINANCEIRAS
-- Data: 2025-11-28 06:15 UTC

-- 1. Verificar se a tabela existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%categorias_financeiras%'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categorias_financeiras_2025_11_28_05_52'
ORDER BY ordinal_position;

-- 3. Contar registos na tabela
SELECT COUNT(*) as total_registos 
FROM public.categorias_financeiras_2025_11_28_05_52;

-- 4. Mostrar todas as categorias
SELECT 
    id,
    nome,
    tipo,
    escopo,
    ativo,
    ordem,
    created_at
FROM public.categorias_financeiras_2025_11_28_05_52 
ORDER BY ordem;

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'categorias_financeiras_2025_11_28_05_52';

-- 6. Testar consulta como seria feita pelo frontend
SELECT id, nome, descricao, tipo, escopo, cor, icone, ativo, ordem
FROM public.categorias_financeiras_2025_11_28_05_52 
WHERE ativo = true 
ORDER BY ordem
LIMIT 5;