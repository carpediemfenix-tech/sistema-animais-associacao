-- APLICAÇÃO COMPLETA DO NOVO SISTEMA DE FORMAÇÃO
-- Executado em: Sun Dec  7 04:44:46 UTC 2025

-- 1. REMOVER SISTEMA ANTIGO
DROP TABLE IF EXISTS public.voluntario_conquistas CASCADE;
DROP TABLE IF EXISTS public.conquistas CASCADE;
DROP TABLE IF EXISTS public.voluntario_especializacoes CASCADE;
DROP TABLE IF EXISTS public.especializacoes CASCADE;
DROP TABLE IF EXISTS public.voluntario_progressao CASCADE;
DROP TABLE IF EXISTS public.niveis_formacao CASCADE;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.get_niveis_formacao_all();
DROP FUNCTION IF EXISTS public.insert_nivel_formacao(TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_nivel_formacao(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT);

-- Remover colunas antigas
ALTER TABLE public.voluntarios DROP COLUMN IF EXISTS nivel_formacao_atual;
ALTER TABLE public.voluntarios DROP COLUMN IF EXISTS tem_formacao;

SELECT 'Sistema antigo removido com sucesso' as status;
