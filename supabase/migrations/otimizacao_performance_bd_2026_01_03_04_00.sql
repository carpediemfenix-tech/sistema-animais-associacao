-- SCRIPT DE OTIMIZAÇÃO E MELHORIA DA PERFORMANCE DA BASE DE DADOS
-- Sistema Valentão Operacionais v2.0
-- Data: 2026-01-03 04:00 UTC

-- ============================================================================
-- 1. CRIAÇÃO DE ÍNDICES PARA MELHORAR PERFORMANCE
-- ============================================================================

-- Índices para tabela animais
CREATE INDEX IF NOT EXISTS idx_animais_estado ON animais(estado);
CREATE INDEX IF NOT EXISTS idx_animais_especie ON animais(especie);
CREATE INDEX IF NOT EXISTS idx_animais_data_entrada ON animais(data_entrada);
CREATE INDEX IF NOT EXISTS idx_animais_arquivado ON animais(arquivado);
CREATE INDEX IF NOT EXISTS idx_animais_grupo_id ON animais(grupo_id);

-- Índices para tabela voluntarios
CREATE INDEX IF NOT EXISTS idx_voluntarios_ativo ON voluntarios(ativo);
CREATE INDEX IF NOT EXISTS idx_voluntarios_especialidade ON voluntarios(especialidade);
CREATE INDEX IF NOT EXISTS idx_voluntarios_data_inicio ON voluntarios(data_inicio);

-- Índices para tabela intervencoes
CREATE INDEX IF NOT EXISTS idx_intervencoes_animal_id ON intervencoes(animal_id);
CREATE INDEX IF NOT EXISTS idx_intervencoes_data ON intervencoes(data_intervencao);
CREATE INDEX IF NOT EXISTS idx_intervencoes_urgente ON intervencoes(urgente);
CREATE INDEX IF NOT EXISTS idx_intervencoes_concluida ON intervencoes(concluida);

-- Índices para tabela notificacoes
CREATE INDEX IF NOT EXISTS idx_notificacoes_utilizador_id ON notificacoes(utilizador_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_arquivada ON notificacoes(arquivada);
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);

-- Índices para tabela denuncias
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias_2025_12_29_23_00(status_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_prioridade ON denuncias_2025_12_29_23_00(prioridade);
CREATE INDEX IF NOT EXISTS idx_denuncias_data ON denuncias_2025_12_29_23_00(data_denuncia);
CREATE INDEX IF NOT EXISTS idx_denuncias_arquivada ON denuncias_2025_12_29_23_00(arquivada);

-- ============================================================================
-- 2. VIEWS PARA CONSULTAS FREQUENTES
-- ============================================================================

-- View para animais ativos com informações resumidas
CREATE OR REPLACE VIEW vw_animais_ativos AS
SELECT 
    a.id,
    a.nome,
    a.especie,
    a.sexo,
    a.estado,
    a.data_entrada,
    a.grupo_id,
    g.nome as grupo_nome,
    COUNT(i.id) as total_intervencoes,
    MAX(i.data_intervencao) as ultima_intervencao
FROM animais a
LEFT JOIN grupos g ON a.grupo_id = g.id
LEFT JOIN intervencoes i ON a.id = i.animal_id
WHERE a.arquivado = false
GROUP BY a.id, a.nome, a.especie, a.sexo, a.estado, a.data_entrada, a.grupo_id, g.nome;

-- View para voluntários ativos com especialidades
CREATE OR REPLACE VIEW vw_voluntarios_ativos AS
SELECT 
    v.id,
    v.nome,
    v.email,
    v.telefone,
    v.especialidade,
    v.data_inicio,
    COUNT(ve.id) as total_especialidades,
    ARRAY_AGG(DISTINCT e.nome) FILTER (WHERE e.nome IS NOT NULL) as especialidades_nomes
FROM voluntarios v
LEFT JOIN voluntario_especialidades_2025_12_21_22_00 ve ON v.id = ve.voluntario_id AND ve.ativo = true
LEFT JOIN especialidades_voluntarios_2025_12_21_22_00 e ON ve.especialidade_id = e.id
WHERE v.ativo = true
GROUP BY v.id, v.nome, v.email, v.telefone, v.especialidade, v.data_inicio;

-- View para estatísticas gerais do sistema
CREATE OR REPLACE VIEW vw_estatisticas_sistema AS
SELECT 
    (SELECT COUNT(*) FROM animais WHERE arquivado = false) as total_animais,
    (SELECT COUNT(*) FROM animais WHERE estado = 'Ativo' AND arquivado = false) as animais_ativos,
    (SELECT COUNT(*) FROM animais WHERE estado = 'Adotado' AND arquivado = false) as animais_adotados,
    (SELECT COUNT(*) FROM voluntarios WHERE ativo = true) as total_voluntarios,
    (SELECT COUNT(*) FROM intervencoes WHERE concluida = false) as intervencoes_pendentes,
    (SELECT COUNT(*) FROM notificacoes WHERE lida = false) as notificacoes_nao_lidas,
    (SELECT COUNT(*) FROM denuncias_2025_12_29_23_00 WHERE status_denuncia != 'concluida') as denuncias_abertas;

-- ============================================================================
-- 3. FUNÇÕES PARA LIMPEZA AUTOMÁTICA
-- ============================================================================

-- Função para limpar logs antigos (mais de 30 dias)
CREATE OR REPLACE FUNCTION limpar_logs_antigos()
RETURNS INTEGER AS $$
DECLARE
    registos_removidos INTEGER;
BEGIN
    -- Remover logs de acesso antigos
    DELETE FROM user_access_logs 
    WHERE data_hora < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS registos_removidos = ROW_COUNT;
    
    -- Log da operação
    INSERT INTO logs_sistema (
        nivel,
        categoria,
        mensagem,
        detalhes,
        created_at
    ) VALUES (
        'info',
        'manutencao',
        'Limpeza automática de logs executada',
        jsonb_build_object('registos_removidos', registos_removidos),
        NOW()
    );
    
    RETURN registos_removidos;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações antigas lidas (mais de 60 dias)
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS INTEGER AS $$
DECLARE
    registos_removidos INTEGER;
BEGIN
    -- Remover notificações lidas antigas
    DELETE FROM notificacoes 
    WHERE lida = true 
    AND arquivada = true 
    AND data_leitura < NOW() - INTERVAL '60 days';
    
    GET DIAGNOSTICS registos_removidos = ROW_COUNT;
    
    -- Log da operação
    INSERT INTO logs_sistema (
        nivel,
        categoria,
        mensagem,
        detalhes,
        created_at
    ) VALUES (
        'info',
        'manutencao',
        'Limpeza automática de notificações executada',
        jsonb_build_object('registos_removidos', registos_removidos),
        NOW()
    );
    
    RETURN registos_removidos;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- ============================================================================

-- Trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tabelas principais
DROP TRIGGER IF EXISTS tr_animais_updated_at ON animais;
CREATE TRIGGER tr_animais_updated_at
    BEFORE UPDATE ON animais
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

DROP TRIGGER IF EXISTS tr_voluntarios_updated_at ON voluntarios;
CREATE TRIGGER tr_voluntarios_updated_at
    BEFORE UPDATE ON voluntarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

DROP TRIGGER IF EXISTS tr_intervencoes_updated_at ON intervencoes;
CREATE TRIGGER tr_intervencoes_updated_at
    BEFORE UPDATE ON intervencoes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

-- ============================================================================
-- 5. TABELA DE LOGS DO SISTEMA
-- ============================================================================

-- Criar tabela de logs se não existir
CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL DEFAULT 'info', -- debug, info, warning, error, critical
    categoria VARCHAR(50) NOT NULL DEFAULT 'sistema', -- sistema, manutencao, performance, seguranca
    mensagem TEXT NOT NULL,
    detalhes JSONB,
    utilizador_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_logs_sistema_nivel ON logs_sistema(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_categoria ON logs_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON logs_sistema(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_utilizador_id ON logs_sistema(utilizador_id);

-- RLS para logs (apenas administradores podem ver)
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de logs
CREATE POLICY "Permitir inserção de logs" ON logs_sistema
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir leitura apenas para administradores
CREATE POLICY "Permitir leitura de logs para administradores" ON logs_sistema
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM utilizadores 
            WHERE username = auth.jwt() ->> 'sub' 
            AND perfil = 'administrador'
        )
    );

-- ============================================================================
-- 6. FUNÇÃO PARA ESTATÍSTICAS DE PERFORMANCE
-- ============================================================================

CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'total_tables', (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ),
        'total_indexes', (
            SELECT COUNT(*) 
            FROM pg_indexes 
            WHERE schemaname = 'public'
        ),
        'active_connections', (
            SELECT COUNT(*) 
            FROM pg_stat_activity 
            WHERE state = 'active'
        ),
        'cache_hit_ratio', (
            SELECT ROUND(
                (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2
            )
            FROM pg_statio_user_tables
        ),
        'slow_queries', (
            SELECT COUNT(*) 
            FROM pg_stat_statements 
            WHERE mean_exec_time > 1000
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. LOG DE EXECUÇÃO DO SCRIPT
-- ============================================================================

-- Registar execução do script de otimização
INSERT INTO logs_sistema (
    nivel,
    categoria,
    mensagem,
    detalhes,
    created_at
) VALUES (
    'info',
    'manutencao',
    'Script de otimização da base de dados executado',
    jsonb_build_object(
        'script_version', '2026_01_03_04_00',
        'indices_criados', 15,
        'views_criadas', 3,
        'funcoes_criadas', 4,
        'triggers_criados', 3
    ),
    NOW()
);

-- Comentário final
COMMENT ON TABLE logs_sistema IS 'Tabela para registar logs do sistema e operações de manutenção';

-- Fim do script