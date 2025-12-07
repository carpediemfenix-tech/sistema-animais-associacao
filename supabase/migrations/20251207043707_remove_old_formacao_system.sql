-- REMOÇÃO COMPLETA DO SISTEMA ANTIGO DE FORMAÇÃO
-- Criado em: 2025-12-07 04:00 UTC

-- Remover tabelas antigas do sistema de formação
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

-- Remover colunas relacionadas com o sistema antigo da tabela voluntarios
ALTER TABLE public.voluntarios DROP COLUMN IF EXISTS nivel_formacao_atual;
ALTER TABLE public.voluntarios DROP COLUMN IF EXISTS tem_formacao;

-- Comentário
COMMENT ON SCHEMA public IS 'Sistema antigo de formação removido - preparando para nova arquitetura';
