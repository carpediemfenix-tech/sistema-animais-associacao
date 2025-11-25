-- Debug das tabelas de opções e políticas RLS
-- Data: 2025-11-25 10:00 UTC

-- Verificar se as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_opcoes'
ORDER BY table_name;

-- Verificar dados nas tabelas
SELECT 'especies_opcoes' as tabela, COUNT(*) as total FROM public.especies_opcoes
UNION ALL
SELECT 'sexos_opcoes' as tabela, COUNT(*) as total FROM public.sexos_opcoes
UNION ALL
SELECT 'especialidades_opcoes' as tabela, COUNT(*) as total FROM public.especialidades_opcoes
UNION ALL
SELECT 'estados_opcoes' as tabela, COUNT(*) as total FROM public.estados_opcoes
UNION ALL
SELECT 'tipos_intervencoes_opcoes' as tabela, COUNT(*) as total FROM public.tipos_intervencoes_opcoes;

-- Verificar algumas amostras de dados
SELECT 'especies_opcoes' as tabela, id, nome, ativo FROM public.especies_opcoes LIMIT 3
UNION ALL
SELECT 'sexos_opcoes' as tabela, id::text, nome, ativo FROM public.sexos_opcoes LIMIT 3
UNION ALL
SELECT 'estados_opcoes' as tabela, id::text, nome, ativo FROM public.estados_opcoes LIMIT 3;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE '%_opcoes'
ORDER BY tablename, policyname;

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%_opcoes'
ORDER BY tablename;