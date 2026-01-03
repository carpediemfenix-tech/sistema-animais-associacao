-- SCRIPT DE VERIFICAÇÃO E OTIMIZAÇÃO DA BASE DE DADOS
-- Sistema Valentão Operacionais v2.0
-- Data: 2026-01-03 04:00 UTC

-- ============================================================================
-- 1. VERIFICAÇÃO DE TABELAS EXISTENTES
-- ============================================================================

-- Verificar se as tabelas principais existem
DO $$
DECLARE
    tabela_existe BOOLEAN;
BEGIN
    -- Verificar tabela animais
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'animais'
    ) INTO tabela_existe;
    
    IF tabela_existe THEN
        RAISE NOTICE 'Tabela animais existe';
    ELSE
        RAISE NOTICE 'Tabela animais NÃO existe';
    END IF;
    
    -- Verificar tabela voluntarios
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'voluntarios'
    ) INTO tabela_existe;
    
    IF tabela_existe THEN
        RAISE NOTICE 'Tabela voluntarios existe';
    ELSE
        RAISE NOTICE 'Tabela voluntarios NÃO existe';
    END IF;
    
    -- Verificar tabela intervencoes
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'intervencoes'
    ) INTO tabela_existe;
    
    IF tabela_existe THEN
        RAISE NOTICE 'Tabela intervencoes existe';
    ELSE
        RAISE NOTICE 'Tabela intervencoes NÃO existe';
    END IF;
    
    -- Verificar tabela notificacoes
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notificacoes'
    ) INTO tabela_existe;
    
    IF tabela_existe THEN
        RAISE NOTICE 'Tabela notificacoes existe';
    ELSE
        RAISE NOTICE 'Tabela notificacoes NÃO existe';
    END IF;
END $$;

-- ============================================================================
-- 2. CRIAÇÃO DE ÍNDICES SEGUROS (APENAS SE AS TABELAS EXISTIREM)
-- ============================================================================

-- Índices para tabela animais (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'animais') THEN
        CREATE INDEX IF NOT EXISTS idx_animais_estado ON animais(estado);
        CREATE INDEX IF NOT EXISTS idx_animais_especie ON animais(especie);
        CREATE INDEX IF NOT EXISTS idx_animais_data_entrada ON animais(data_entrada);
        CREATE INDEX IF NOT EXISTS idx_animais_arquivado ON animais(arquivado);
        RAISE NOTICE 'Índices criados para tabela animais';
    END IF;
END $$;

-- Índices para tabela notificacoes (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notificacoes') THEN
        CREATE INDEX IF NOT EXISTS idx_notificacoes_utilizador_id ON notificacoes(utilizador_id);
        CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
        CREATE INDEX IF NOT EXISTS idx_notificacoes_arquivada ON notificacoes(arquivada);
        CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);
        CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);
        RAISE NOTICE 'Índices criados para tabela notificacoes';
    END IF;
END $$;

-- Índices para tabela denuncias (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'denuncias_2025_12_29_23_00') THEN
        CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias_2025_12_29_23_00(status_denuncia);
        CREATE INDEX IF NOT EXISTS idx_denuncias_prioridade ON denuncias_2025_12_29_23_00(prioridade);
        CREATE INDEX IF NOT EXISTS idx_denuncias_data ON denuncias_2025_12_29_23_00(data_denuncia);
        CREATE INDEX IF NOT EXISTS idx_denuncias_arquivada ON denuncias_2025_12_29_23_00(arquivada);
        RAISE NOTICE 'Índices criados para tabela denuncias';
    END IF;
END $$;

-- ============================================================================
-- 3. TABELA DE LOGS DO SISTEMA (SEMPRE CRIAR)
-- ============================================================================

-- Criar tabela de logs se não existir
CREATE TABLE IF NOT EXISTS logs_sistema_2026_01_03_04_00 (
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
CREATE INDEX IF NOT EXISTS idx_logs_sistema_nivel_2026_01_03_04_00 ON logs_sistema_2026_01_03_04_00(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_categoria_2026_01_03_04_00 ON logs_sistema_2026_01_03_04_00(categoria);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at_2026_01_03_04_00 ON logs_sistema_2026_01_03_04_00(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_utilizador_id_2026_01_03_04_00 ON logs_sistema_2026_01_03_04_00(utilizador_id);

-- RLS para logs (apenas administradores podem ver)
ALTER TABLE logs_sistema_2026_01_03_04_00 ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de logs
DROP POLICY IF EXISTS "Permitir inserção de logs" ON logs_sistema_2026_01_03_04_00;
CREATE POLICY "Permitir inserção de logs" ON logs_sistema_2026_01_03_04_00
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir leitura para todos (desenvolvimento)
DROP POLICY IF EXISTS "Permitir leitura de logs" ON logs_sistema_2026_01_03_04_00;
CREATE POLICY "Permitir leitura de logs" ON logs_sistema_2026_01_03_04_00
    FOR SELECT
    USING (true);

-- ============================================================================
-- 4. FUNÇÕES PARA LIMPEZA AUTOMÁTICA
-- ============================================================================

-- Função para limpar logs antigos (mais de 30 dias)
CREATE OR REPLACE FUNCTION limpar_logs_antigos_2026_01_03_04_00()
RETURNS INTEGER AS $$
DECLARE
    registos_removidos INTEGER := 0;
BEGIN
    -- Verificar se a tabela user_access_logs existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_access_logs') THEN
        -- Remover logs de acesso antigos
        DELETE FROM user_access_logs 
        WHERE data_hora < NOW() - INTERVAL '30 days';
        
        GET DIAGNOSTICS registos_removidos = ROW_COUNT;
    END IF;
    
    -- Log da operação
    INSERT INTO logs_sistema_2026_01_03_04_00 (
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
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas_2026_01_03_04_00()
RETURNS INTEGER AS $$
DECLARE
    registos_removidos INTEGER := 0;
BEGIN
    -- Verificar se a tabela notificacoes existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notificacoes') THEN
        -- Remover notificações lidas antigas
        DELETE FROM notificacoes 
        WHERE lida = true 
        AND arquivada = true 
        AND data_leitura < NOW() - INTERVAL '60 days';
        
        GET DIAGNOSTICS registos_removidos = ROW_COUNT;
    END IF;
    
    -- Log da operação
    INSERT INTO logs_sistema_2026_01_03_04_00 (
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
-- 5. FUNÇÃO PARA ESTATÍSTICAS DE PERFORMANCE
-- ============================================================================

CREATE OR REPLACE FUNCTION get_performance_stats_2026_01_03_04_00()
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
        'timestamp', NOW()
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- ============================================================================

-- Função para trigger de updated_at
CREATE OR REPLACE FUNCTION trigger_updated_at_2026_01_03_04_00()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. LOG DE EXECUÇÃO DO SCRIPT
-- ============================================================================

-- Registar execução do script de otimização
INSERT INTO logs_sistema_2026_01_03_04_00 (
    nivel,
    categoria,
    mensagem,
    detalhes,
    created_at
) VALUES (
    'info',
    'manutencao',
    'Script de otimização da base de dados executado com sucesso',
    jsonb_build_object(
        'script_version', '2026_01_03_04_00',
        'tabela_logs_criada', true,
        'funcoes_criadas', 4,
        'indices_verificados', true,
        'rls_configurado', true
    ),
    NOW()
);

-- Comentário final
COMMENT ON TABLE logs_sistema_2026_01_03_04_00 IS 'Tabela para registar logs do sistema e operações de manutenção - Versão 2026-01-03';

-- Fim do script