-- Desativar RLS temporariamente nas tabelas de opções para debug
-- Data: 2025-11-25 10:00 UTC

-- Desativar RLS nas tabelas de opções
ALTER TABLE public.especies_opcoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sexos_opcoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades_opcoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_opcoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_intervencoes_opcoes DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%_opcoes'
ORDER BY tablename;

-- Testar acesso direto aos dados
SELECT 'especies_opcoes' as tabela, COUNT(*) as total FROM public.especies_opcoes;
SELECT 'sexos_opcoes' as tabela, COUNT(*) as total FROM public.sexos_opcoes;
SELECT 'especialidades_opcoes' as tabela, COUNT(*) as total FROM public.especialidades_opcoes;
SELECT 'estados_opcoes' as tabela, COUNT(*) as total FROM public.estados_opcoes;
SELECT 'tipos_intervencoes_opcoes' as tabela, COUNT(*) as total FROM public.tipos_intervencoes_opcoes;