-- Debug das tabelas de opções (CORRIGIDO)
-- Data: 2025-11-25 10:00 UTC

-- Verificar se as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_opcoes'
ORDER BY table_name;

-- Verificar dados nas tabelas
SELECT 'especies_opcoes' as tabela, COUNT(*) as total FROM public.especies_opcoes;

SELECT 'sexos_opcoes' as tabela, COUNT(*) as total FROM public.sexos_opcoes;

SELECT 'especialidades_opcoes' as tabela, COUNT(*) as total FROM public.especialidades_opcoes;

SELECT 'estados_opcoes' as tabela, COUNT(*) as total FROM public.estados_opcoes;

SELECT 'tipos_intervencoes_opcoes' as tabela, COUNT(*) as total FROM public.tipos_intervencoes_opcoes;

-- Verificar amostras de dados
SELECT id, nome, ativo FROM public.especies_opcoes LIMIT 5;

SELECT id, nome, ativo FROM public.sexos_opcoes LIMIT 5;

SELECT id, nome, ativo FROM public.estados_opcoes LIMIT 5;

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%_opcoes'
ORDER BY tablename;