-- =====================================================
-- VERIFICAÇÃO ESTRUTURA TABELA CATEGORIAS - DEBUG COR
-- Data: 2026-01-07 01:15 UTC
-- =====================================================

-- Verificar colunas da tabela categorias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categorias_aprovisionamento_2026_01_06'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados existentes na tabela
SELECT * FROM public.categorias_aprovisionamento_2026_01_06 LIMIT 5;