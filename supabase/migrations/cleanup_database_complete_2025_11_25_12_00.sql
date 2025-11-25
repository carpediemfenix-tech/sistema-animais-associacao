-- Limpeza completa da base de dados - remover elementos obsoletos
-- Data: 2025-11-25 12:00 UTC
-- ATENÇÃO: Este script remove permanentemente tabelas e dados obsoletos

-- 1. REMOVER POLÍTICAS RLS DAS TABELAS OBSOLETAS
DROP POLICY IF EXISTS "Todos podem ler espécies" ON public.especies_opcoes;
DROP POLICY IF EXISTS "Admins podem gerir espécies" ON public.especies_opcoes;
DROP POLICY IF EXISTS "Todos podem ler sexos" ON public.sexos_opcoes;
DROP POLICY IF EXISTS "Admins podem gerir sexos" ON public.sexos_opcoes;
DROP POLICY IF EXISTS "Todos podem ler especialidades" ON public.especialidades_opcoes;
DROP POLICY IF EXISTS "Admins podem gerir especialidades" ON public.especialidades_opcoes;
DROP POLICY IF EXISTS "Todos podem ler estados" ON public.estados_opcoes;
DROP POLICY IF EXISTS "Admins podem gerir estados" ON public.estados_opcoes;
DROP POLICY IF EXISTS "Todos podem ler tipos intervenções" ON public.tipos_intervencoes_opcoes;
DROP POLICY IF EXISTS "Admins podem gerir tipos intervenções" ON public.tipos_intervencoes_opcoes;

-- 2. REMOVER ÍNDICES DAS TABELAS OBSOLETAS
DROP INDEX IF EXISTS idx_especies_opcoes_ativo;
DROP INDEX IF EXISTS idx_sexos_opcoes_ativo;
DROP INDEX IF EXISTS idx_especialidades_opcoes_ativo;
DROP INDEX IF EXISTS idx_estados_opcoes_ativo;
DROP INDEX IF EXISTS idx_tipos_intervencoes_opcoes_ativo;

-- 3. REMOVER TABELAS OBSOLETAS (ordem importante devido a foreign keys)
DROP TABLE IF EXISTS public.tipos_intervencoes_opcoes CASCADE;
DROP TABLE IF EXISTS public.estados_opcoes CASCADE;
DROP TABLE IF EXISTS public.especialidades_opcoes CASCADE;
DROP TABLE IF EXISTS public.sexos_opcoes CASCADE;
DROP TABLE IF EXISTS public.especies_opcoes CASCADE;

-- 4. VERIFICAR SE AS TABELAS CORRETAS EXISTEM E ESTÃO POPULADAS
SELECT 'VERIFICAÇÃO PÓS-LIMPEZA' as status;

-- Verificar tabelas corretas
SELECT 'especies' as tabela, COUNT(*) as registros FROM public.especies
UNION ALL
SELECT 'sexos' as tabela, COUNT(*) as registros FROM public.sexos
UNION ALL
SELECT 'especialidades_voluntarios' as tabela, COUNT(*) as registros FROM public.especialidades_voluntarios
UNION ALL
SELECT 'tipos_grupos' as tabela, COUNT(*) as registros FROM public.tipos_grupos
UNION ALL
SELECT 'tipos_eventos' as tabela, COUNT(*) as registros FROM public.tipos_eventos
UNION ALL
SELECT 'tipos_localizacoes' as tabela, COUNT(*) as registros FROM public.tipos_localizacoes
UNION ALL
SELECT 'tipos_intervencoes' as tabela, COUNT(*) as registros FROM public.tipos_intervencoes;

-- 5. LISTAR TABELAS RESTANTES PARA CONFIRMAÇÃO
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE 'pg_%'
ORDER BY table_name;

-- 6. OTIMIZAR ESTATÍSTICAS DAS TABELAS RESTANTES
ANALYZE public.especies;
ANALYZE public.sexos;
ANALYZE public.especialidades_voluntarios;
ANALYZE public.tipos_grupos;
ANALYZE public.tipos_eventos;
ANALYZE public.tipos_localizacoes;
ANALYZE public.tipos_intervencoes;
ANALYZE public.animais;
ANALYZE public.voluntarios;
ANALYZE public.grupos;
ANALYZE public.intervencoes;
ANALYZE public.eventos;
ANALYZE public.localizacoes;
ANALYZE public.movimentos_financeiros;

-- 7. VACUUM PARA RECUPERAR ESPAÇO
VACUUM ANALYZE;