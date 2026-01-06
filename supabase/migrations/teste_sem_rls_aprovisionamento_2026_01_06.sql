-- =====================================================
-- TESTE TEMPORÁRIO - DESABILITAR RLS PARA DIAGNÓSTICO
-- =====================================================

-- Desabilitar RLS temporariamente para teste
ALTER TABLE public.categorias_aprovisionamento_2026_01_06 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_aprovisionamento_2026_01_06 DISABLE ROW LEVEL SECURITY;

-- Verificar se os dados estão realmente lá
SELECT 'Teste sem RLS - CATEGORIAS' as tipo, COUNT(*) as total FROM public.categorias_aprovisionamento_2026_01_06;
SELECT 'Teste sem RLS - TIPOS' as tipo, COUNT(*) as total FROM public.tipos_aprovisionamento_2026_01_06;

-- Listar todas as categorias
SELECT id, nome, ativo FROM public.categorias_aprovisionamento_2026_01_06 ORDER BY nome;

-- Contar tipos por categoria
SELECT 
    c.nome as categoria,
    COUNT(t.id) as total_tipos
FROM public.categorias_aprovisionamento_2026_01_06 c
LEFT JOIN public.tipos_aprovisionamento_2026_01_06 t ON c.id = t.categoria_id
GROUP BY c.id, c.nome
ORDER BY c.nome;

-- Reabilitar RLS após teste
ALTER TABLE public.categorias_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;