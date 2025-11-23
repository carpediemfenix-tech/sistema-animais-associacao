-- ========================================
-- OTIMIZAÇÃO DA BASE DE DADOS - CORRIGIDA
-- Sistema Valentão - Novembro 2025
-- ========================================

-- 1. LIMPEZA DE DADOS OBSOLETOS
SELECT 'INICIANDO LIMPEZA...' as status;

-- Limpar activity_logs antigos (manter apenas últimos 30 dias)
DELETE FROM public.activity_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpar tentativas de login excessivas
UPDATE public.users 
SET tentativas_login = 0 
WHERE tentativas_login > 5;

-- 2. CRIAÇÃO DE ÍNDICES ESSENCIAIS
SELECT 'CRIANDO ÍNDICES...' as status;

-- Índices para animais (queries mais frequentes)
CREATE INDEX IF NOT EXISTS idx_animais_estado ON public.animais(estado);
CREATE INDEX IF NOT EXISTS idx_animais_arquivado ON public.animais(arquivado);
CREATE INDEX IF NOT EXISTS idx_animais_especie ON public.animais(especie);
CREATE INDEX IF NOT EXISTS idx_animais_grupo_id ON public.animais(grupo_id);

-- Índices para intervenções
CREATE INDEX IF NOT EXISTS idx_intervencoes_animal_id ON public.intervencoes(animal_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_data ON public.intervencoes(data_intervencao);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_eventos_animal_id ON public.eventos(animal_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON public.eventos(data_evento);

-- Índices para localizações
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_id ON public.localizacoes(animal_id);

-- Índices para movimentos financeiros
CREATE INDEX IF NOT EXISTS idx_movimentos_data ON public.movimentos_financeiros(data_movimento);

-- Índices para utilizadores
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_ativo ON public.users(ativo);

-- 3. ATUALIZAR ESTATÍSTICAS
SELECT 'ATUALIZANDO ESTATÍSTICAS...' as status;

ANALYZE public.animais;
ANALYZE public.intervencoes;
ANALYZE public.eventos;
ANALYZE public.movimentos_financeiros;
ANALYZE public.users;

-- 4. RELATÓRIO FINAL
SELECT 'OTIMIZAÇÃO CONCLUÍDA!' as status;

SELECT 
    'Total de índices criados' as item,
    COUNT(*) as quantidade
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

SELECT 
    'Registos por tabela:' as info;

SELECT 'animais' as tabela, COUNT(*) as registos FROM public.animais
UNION ALL
SELECT 'users' as tabela, COUNT(*) as registos FROM public.users
UNION ALL
SELECT 'intervencoes' as tabela, COUNT(*) as registos FROM public.intervencoes
UNION ALL
SELECT 'eventos' as tabela, COUNT(*) as registos FROM public.eventos
ORDER BY registos DESC;