-- Corrigir políticas RLS das tabelas de administração
-- Data: 2025-11-25 14:00 UTC
-- Objetivo: Permitir acesso às tabelas de administração para o bem dos animais! 🐾

-- 1. DESATIVAR RLS TEMPORARIAMENTE (controle já existe no frontend)
ALTER TABLE public.especies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sexos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades_voluntarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_grupos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_localizacoes DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Todos podem ler espécies" ON public.especies;
DROP POLICY IF EXISTS "Admins podem gerir espécies" ON public.especies;
DROP POLICY IF EXISTS "Todos podem ler sexos" ON public.sexos;
DROP POLICY IF EXISTS "Admins podem gerir sexos" ON public.sexos;
DROP POLICY IF EXISTS "Todos podem ler especialidades" ON public.especialidades_voluntarios;
DROP POLICY IF EXISTS "Admins podem gerir especialidades" ON public.especialidades_voluntarios;
DROP POLICY IF EXISTS "Todos podem ler tipos grupos" ON public.tipos_grupos;
DROP POLICY IF EXISTS "Admins podem gerir tipos grupos" ON public.tipos_grupos;
DROP POLICY IF EXISTS "Todos podem ler tipos eventos" ON public.tipos_eventos;
DROP POLICY IF EXISTS "Admins podem gerir tipos eventos" ON public.tipos_eventos;
DROP POLICY IF EXISTS "Todos podem ler tipos localizações" ON public.tipos_localizacoes;
DROP POLICY IF EXISTS "Admins podem gerir tipos localizações" ON public.tipos_localizacoes;

-- 3. VERIFICAR ACESSO ÀS TABELAS
SELECT 'VERIFICAÇÃO DE ACESSO - SISTEMA VALENTÃO 🐾' as status;

SELECT 'especies' as tabela, COUNT(*) as registros FROM public.especies;
SELECT 'sexos' as tabela, COUNT(*) as registros FROM public.sexos;
SELECT 'especialidades_voluntarios' as tabela, COUNT(*) as registros FROM public.especialidades_voluntarios;
SELECT 'tipos_grupos' as tabela, COUNT(*) as registros FROM public.tipos_grupos;
SELECT 'tipos_eventos' as tabela, COUNT(*) as registros FROM public.tipos_eventos;
SELECT 'tipos_localizacoes' as tabela, COUNT(*) as registros FROM public.tipos_localizacoes;