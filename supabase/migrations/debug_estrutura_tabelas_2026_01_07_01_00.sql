-- =====================================================
-- VERIFICAÇÃO DE ESTRUTURA DAS TABELAS - DEBUG 400
-- Data: 2026-01-07 01:00 UTC
-- =====================================================

-- 1. Verificar se as tabelas existem e suas colunas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN (
    'atribuicoes_itens_2026_01_07_00_52',
    'itens_aprovisionamento_2026_01_06',
    'tipos_aprovisionamento_2026_01_06',
    'categorias_aprovisionamento_2026_01_06'
)
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Verificar foreign keys existentes
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN (
    'atribuicoes_itens_2026_01_07_00_52',
    'itens_aprovisionamento_2026_01_06',
    'tipos_aprovisionamento_2026_01_06'
);

-- 3. Testar consulta simples nas tabelas
SELECT COUNT(*) as total_atribuicoes FROM public.atribuicoes_itens_2026_01_07_00_52;
SELECT COUNT(*) as total_itens FROM public.itens_aprovisionamento_2026_01_06;
SELECT COUNT(*) as total_tipos FROM public.tipos_aprovisionamento_2026_01_06;
SELECT COUNT(*) as total_categorias FROM public.categorias_aprovisionamento_2026_01_06;