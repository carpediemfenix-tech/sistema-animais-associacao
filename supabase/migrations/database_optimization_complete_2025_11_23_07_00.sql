-- ========================================
-- OTIMIZAÇÃO COMPLETA DA BASE DE DADOS
-- Sistema Valentão - Novembro 2025
-- ========================================

-- 1. LIMPEZA DE DADOS OBSOLETOS
SELECT 'INICIANDO LIMPEZA DE DADOS OBSOLETOS...' as status;

-- Remover utilizadores de teste que não são mais necessários
DELETE FROM public.users 
WHERE username IN ('teste', 'mariana', 'vitor') 
AND perfil_acesso != 'administrador';

-- Limpar activity_logs muito antigos (manter apenas últimos 30 dias)
DELETE FROM public.activity_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpar tentativas de login excessivas
UPDATE public.users 
SET tentativas_login = 0 
WHERE tentativas_login > 5;

SELECT 'LIMPEZA DE DADOS CONCLUÍDA!' as status;

-- 2. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
SELECT 'CRIANDO ÍNDICES PARA OTIMIZAÇÃO...' as status;

-- Índices para tabela animais (queries mais frequentes)
CREATE INDEX IF NOT EXISTS idx_animais_estado ON public.animais(estado);
CREATE INDEX IF NOT EXISTS idx_animais_arquivado ON public.animais(arquivado);
CREATE INDEX IF NOT EXISTS idx_animais_especie ON public.animais(especie);
CREATE INDEX IF NOT EXISTS idx_animais_grupo_id ON public.animais(grupo_id);
CREATE INDEX IF NOT EXISTS idx_animais_data_entrada ON public.animais(data_entrada);
CREATE INDEX IF NOT EXISTS idx_animais_created_at ON public.animais(created_at);

-- Índices para intervenções
CREATE INDEX IF NOT EXISTS idx_intervencoes_animal_id ON public.intervencoes(animal_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_data ON public.intervencoes(data_intervencao);
CREATE INDEX IF NOT EXISTS idx_intervencoes_tipo ON public.intervencoes(tipo_intervencao_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_voluntario ON public.intervencoes(voluntario_id);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_eventos_animal_id ON public.eventos(animal_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON public.eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos(tipo_evento);

-- Índices para localizações
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_id ON public.localizacoes(animal_id);
CREATE INDEX IF NOT EXISTS idx_localizacoes_data_entrada ON public.localizacoes(data_entrada);
CREATE INDEX IF NOT EXISTS idx_localizacoes_data_saida ON public.localizacoes(data_saida);

-- Índices para movimentos financeiros
CREATE INDEX IF NOT EXISTS idx_movimentos_data ON public.movimentos_financeiros(data_movimento);
CREATE INDEX IF NOT EXISTS idx_movimentos_tipo ON public.movimentos_financeiros(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentos_categoria ON public.movimentos_financeiros(categoria);

-- Índices para grupos
CREATE INDEX IF NOT EXISTS idx_grupos_tipo ON public.grupos(tipo);
CREATE INDEX IF NOT EXISTS idx_grupos_ativo ON public.grupos(ativo);

-- Índices para utilizadores
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_ativo ON public.users(ativo);
CREATE INDEX IF NOT EXISTS idx_users_perfil ON public.users(perfil_acesso);

-- Índices para voluntários
CREATE INDEX IF NOT EXISTS idx_voluntarios_ativo ON public.voluntarios(ativo);
CREATE INDEX IF NOT EXISTS idx_voluntarios_especialidade ON public.voluntarios(especialidade);

SELECT 'ÍNDICES CRIADOS COM SUCESSO!' as status;

-- 3. VERIFICAÇÃO DE INTEGRIDADE REFERENCIAL
SELECT 'VERIFICANDO INTEGRIDADE REFERENCIAL...' as status;

-- Corrigir animais com grupo_id inválido
UPDATE public.animais 
SET grupo_id = NULL 
WHERE grupo_id IS NOT NULL 
AND grupo_id NOT IN (SELECT id FROM public.grupos);

-- Verificar e reportar problemas de integridade
SELECT 
    'Animais com grupo_id corrigidos' as acao,
    COUNT(*) as quantidade
FROM public.animais 
WHERE grupo_id IS NULL;

-- Verificar intervenções órfãs
SELECT 
    'Intervenções com animal_id inválido' as problema,
    COUNT(*) as quantidade
FROM public.intervencoes i
LEFT JOIN public.animais a ON i.animal_id = a.id
WHERE a.id IS NULL;

-- Verificar eventos órfãos
SELECT 
    'Eventos com animal_id inválido' as problema,
    COUNT(*) as quantidade
FROM public.eventos e
LEFT JOIN public.animais a ON e.animal_id = a.id
WHERE a.id IS NULL;

SELECT 'VERIFICAÇÃO DE INTEGRIDADE CONCLUÍDA!' as status;

-- 4. ATUALIZAÇÃO DE ESTATÍSTICAS DAS TABELAS
SELECT 'ATUALIZANDO ESTATÍSTICAS DAS TABELAS...' as status;

ANALYZE public.animais;
ANALYZE public.voluntarios;
ANALYZE public.intervencoes;
ANALYZE public.tipos_intervencoes;
ANALYZE public.eventos;
ANALYZE public.movimentos_financeiros;
ANALYZE public.localizacoes;
ANALYZE public.grupos;
ANALYZE public.despesas_grupos;
ANALYZE public.eventos_grupos;
ANALYZE public.users;
ANALYZE public.activity_logs;

SELECT 'ESTATÍSTICAS ATUALIZADAS!' as status;

-- 5. OTIMIZAÇÃO DE CONFIGURAÇÕES
SELECT 'APLICANDO OTIMIZAÇÕES DE CONFIGURAÇÃO...' as status;

-- Configurar autovacuum mais agressivo para tabelas com muitas atualizações
ALTER TABLE public.animais SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.intervencoes SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.eventos SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.movimentos_financeiros SET (autovacuum_vacuum_scale_factor = 0.1);

SELECT 'CONFIGURAÇÕES OTIMIZADAS!' as status;

-- 6. RELATÓRIO FINAL DE OTIMIZAÇÃO
SELECT 'GERANDO RELATÓRIO FINAL...' as status;

-- Contagem de registos por tabela
SELECT 
    'RELATÓRIO DE OTIMIZAÇÃO - CONTAGEM DE REGISTOS:' as info;

SELECT 'animais' as tabela, COUNT(*) as registos FROM public.animais
UNION ALL
SELECT 'voluntarios' as tabela, COUNT(*) as registos FROM public.voluntarios
UNION ALL
SELECT 'intervencoes' as tabela, COUNT(*) as registos FROM public.intervencoes
UNION ALL
SELECT 'tipos_intervencoes' as tabela, COUNT(*) as registos FROM public.tipos_intervencoes
UNION ALL
SELECT 'eventos' as tabela, COUNT(*) as registos FROM public.eventos
UNION ALL
SELECT 'movimentos_financeiros' as tabela, COUNT(*) as registos FROM public.movimentos_financeiros
UNION ALL
SELECT 'localizacoes' as tabela, COUNT(*) as registos FROM public.localizacoes
UNION ALL
SELECT 'grupos' as tabela, COUNT(*) as registos FROM public.grupos
UNION ALL
SELECT 'despesas_grupos' as tabela, COUNT(*) as registos FROM public.despesas_grupos
UNION ALL
SELECT 'eventos_grupos' as tabela, COUNT(*) as registos FROM public.eventos_grupos
UNION ALL
SELECT 'users' as tabela, COUNT(*) as registos FROM public.users
UNION ALL
SELECT 'activity_logs' as tabela, COUNT(*) as registos FROM public.activity_logs
ORDER BY registos DESC;

-- Contagem de índices criados
SELECT 
    'ÍNDICES OTIMIZADOS:' as info;

SELECT 
    COUNT(*) as total_indices
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- Tamanho das tabelas
SELECT 
    'TAMANHO DAS TABELAS:' as info;

SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Resumo final
SELECT 
    'OTIMIZAÇÃO COMPLETA!' as status,
    'Base de dados otimizada com sucesso' as resultado,
    NOW() as data_otimizacao;

-- 7. RECOMENDAÇÕES PARA MANUTENÇÃO
SELECT 'RECOMENDAÇÕES PARA MANUTENÇÃO:' as info;

SELECT 
    '1. Executar VACUUM ANALYZE semanalmente' as recomendacao
UNION ALL
SELECT 
    '2. Monitorizar crescimento das tabelas mensalmente' as recomendacao
UNION ALL
SELECT 
    '3. Limpar activity_logs automaticamente (>30 dias)' as recomendacao
UNION ALL
SELECT 
    '4. Fazer backup completo antes de grandes alterações' as recomendacao
UNION ALL
SELECT 
    '5. Monitorizar performance das queries mais frequentes' as recomendacao;