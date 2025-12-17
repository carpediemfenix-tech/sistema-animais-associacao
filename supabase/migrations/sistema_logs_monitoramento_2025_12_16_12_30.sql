-- ========================================
-- SISTEMA DE LOGS E MONITORAMENTO SEGURO
-- ========================================
-- Este sistema NÃO usa triggers automáticos para evitar quebrar funcionalidades existentes

-- Tabela de logs de sistema
CREATE TABLE IF NOT EXISTS public.logs_sistema_2025_12_16_12_30 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    usuario_id UUID,
    sessao_id VARCHAR(100),
    
    -- Dados do log
    nivel VARCHAR(20) DEFAULT 'info' CHECK (nivel IN ('debug', 'info', 'warning', 'error', 'critical')),
    categoria VARCHAR(50) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Contexto
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    dados_contexto JSONB DEFAULT '{}',
    
    -- Técnico
    ip_address INET,
    user_agent TEXT,
    url_origem VARCHAR(500),
    
    -- Timing
    duracao_ms INTEGER,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de métricas de performance
CREATE TABLE IF NOT EXISTS public.metricas_performance_2025_12_16_12_30 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    endpoint VARCHAR(200) NOT NULL,
    metodo VARCHAR(10) DEFAULT 'GET',
    
    -- Métricas
    tempo_resposta_ms INTEGER NOT NULL,
    status_code INTEGER,
    tamanho_resposta_bytes INTEGER,
    
    -- Contexto
    usuario_id UUID,
    ip_address INET,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_logs_sistema_categoria_data ON public.logs_sistema_2025_12_16_12_30(categoria, created_at);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_nivel_data ON public.logs_sistema_2025_12_16_12_30(nivel, created_at);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario ON public.logs_sistema_2025_12_16_12_30(usuario_id, created_at);
CREATE INDEX IF NOT EXISTS idx_metricas_performance_endpoint ON public.metricas_performance_2025_12_16_12_30(endpoint, created_at);

-- Função para registrar log (MANUAL - sem triggers)
CREATE OR REPLACE FUNCTION registrar_log(
    p_categoria VARCHAR,
    p_acao VARCHAR,
    p_descricao TEXT DEFAULT NULL,
    p_nivel VARCHAR DEFAULT 'info',
    p_usuario_id UUID DEFAULT NULL,
    p_tabela_afetada VARCHAR DEFAULT NULL,
    p_registro_id UUID DEFAULT NULL,
    p_dados_contexto JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.logs_sistema_2025_12_16_12_30 (
        categoria, acao, descricao, nivel, usuario_id, 
        tabela_afetada, registro_id, dados_contexto
    ) VALUES (
        p_categoria, p_acao, p_descricao, p_nivel, p_usuario_id,
        p_tabela_afetada, p_registro_id, p_dados_contexto
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar métrica de performance
CREATE OR REPLACE FUNCTION registrar_metrica_performance(
    p_endpoint VARCHAR,
    p_tempo_resposta_ms INTEGER,
    p_metodo VARCHAR DEFAULT 'GET',
    p_status_code INTEGER DEFAULT 200,
    p_tamanho_resposta_bytes INTEGER DEFAULT NULL,
    p_usuario_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_metrica_id UUID;
BEGIN
    INSERT INTO public.metricas_performance_2025_12_16_12_30 (
        endpoint, tempo_resposta_ms, metodo, status_code, 
        tamanho_resposta_bytes, usuario_id
    ) VALUES (
        p_endpoint, p_tempo_resposta_ms, p_metodo, p_status_code,
        p_tamanho_resposta_bytes, p_usuario_id
    ) RETURNING id INTO v_metrica_id;
    
    RETURN v_metrica_id;
END;
$$ LANGUAGE plpgsql;

-- View para dashboard de logs
CREATE OR REPLACE VIEW public.dashboard_logs AS
SELECT 
    nivel,
    categoria,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as ultima_hora,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as ultimas_24h,
    MAX(created_at) as ultimo_log
FROM public.logs_sistema_2025_12_16_12_30
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY nivel, categoria
ORDER BY total DESC;

-- View para métricas de performance
CREATE OR REPLACE VIEW public.dashboard_performance AS
SELECT 
    endpoint,
    COUNT(*) as total_requests,
    AVG(tempo_resposta_ms) as tempo_medio_ms,
    MIN(tempo_resposta_ms) as tempo_min_ms,
    MAX(tempo_resposta_ms) as tempo_max_ms,
    COUNT(*) FILTER (WHERE status_code >= 400) as erros,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as requests_ultima_hora
FROM public.metricas_performance_2025_12_16_12_30
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY endpoint
ORDER BY total_requests DESC;

-- Função para obter relatório de sistema
CREATE OR REPLACE FUNCTION obter_relatorio_sistema()
RETURNS JSONB AS $$
DECLARE
    v_cache JSONB;
    v_relatorio JSONB;
BEGIN
    -- Verificar cache primeiro
    v_cache := obter_cache('relatorio_sistema');
    
    IF v_cache IS NOT NULL THEN
        RETURN v_cache;
    END IF;
    
    -- Gerar relatório
    SELECT jsonb_build_object(
        'logs_resumo', (
            SELECT jsonb_agg(row_to_json(d)) 
            FROM public.dashboard_logs d 
            LIMIT 10
        ),
        'performance_resumo', (
            SELECT jsonb_agg(row_to_json(p)) 
            FROM public.dashboard_performance p 
            LIMIT 10
        ),
        'estatisticas_gerais', (
            SELECT jsonb_build_object(
                'total_logs_24h', COUNT(*),
                'logs_erro_24h', COUNT(*) FILTER (WHERE nivel IN ('error', 'critical')),
                'tempo_medio_resposta', (
                    SELECT AVG(tempo_resposta_ms) 
                    FROM public.metricas_performance_2025_12_16_12_30 
                    WHERE created_at >= NOW() - INTERVAL '24 hours'
                )
            )
            FROM public.logs_sistema_2025_12_16_12_30
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        ),
        'gerado_em', NOW()
    ) INTO v_relatorio;
    
    -- Cache por 5 minutos
    PERFORM definir_cache('relatorio_sistema', v_relatorio, 300);
    
    RETURN v_relatorio;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION limpar_logs_antigos()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Manter apenas logs dos últimos 30 dias (exceto críticos)
    DELETE FROM public.logs_sistema_2025_12_16_12_30 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND nivel != 'critical';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Manter métricas apenas dos últimos 7 dias
    DELETE FROM public.metricas_performance_2025_12_16_12_30 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- RLS para logs e métricas
ALTER TABLE public.logs_sistema_2025_12_16_12_30 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_performance_2025_12_16_12_30 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logs acessíveis por usuários autenticados" ON public.logs_sistema_2025_12_16_12_30
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Métricas acessíveis por usuários autenticados" ON public.metricas_performance_2025_12_16_12_30
    FOR ALL USING (auth.role() = 'authenticated');

SELECT 'Sistema de logs e monitoramento implementado com sucesso!' as status;