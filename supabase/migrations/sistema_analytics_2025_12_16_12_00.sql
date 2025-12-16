-- Sistema de Analytics e Métricas Avançadas
-- Criado em: 2025-12-16 12:00 UTC

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS public.analytics_eventos_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID,
    sessao_id VARCHAR(100),
    
    -- Dados do evento
    evento VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    label VARCHAR(200),
    valor NUMERIC,
    
    -- Contexto da página
    pagina_url VARCHAR(500),
    pagina_titulo VARCHAR(200),
    referrer VARCHAR(500),
    
    -- Dados do usuário
    user_agent TEXT,
    ip_address INET,
    dispositivo VARCHAR(50),
    navegador VARCHAR(50),
    sistema_operacional VARCHAR(50),
    
    -- Localização
    pais VARCHAR(2),
    cidade VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Dados técnicos
    resolucao_tela VARCHAR(20),
    viewport VARCHAR(20),
    tempo_carregamento INTEGER, -- milissegundos
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de métricas de performance
CREATE TABLE IF NOT EXISTS public.metricas_performance_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    pagina VARCHAR(200) NOT NULL,
    usuario_id UUID,
    sessao_id VARCHAR(100),
    
    -- Métricas de carregamento
    tempo_carregamento_total INTEGER, -- milissegundos
    tempo_primeiro_byte INTEGER,
    tempo_dom_ready INTEGER,
    tempo_primeiro_paint INTEGER,
    tempo_primeiro_conteudo INTEGER,
    
    -- Métricas de interação
    tempo_primeira_interacao INTEGER,
    cumulative_layout_shift NUMERIC(5,4),
    first_input_delay INTEGER,
    
    -- Métricas de recursos
    tamanho_pagina INTEGER, -- bytes
    numero_requests INTEGER,
    recursos_bloqueantes INTEGER,
    
    -- Métricas de erro
    erros_javascript INTEGER DEFAULT 0,
    erros_rede INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    
    -- Contexto
    dispositivo VARCHAR(50),
    conexao VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de sessões de usuário
CREATE TABLE IF NOT EXISTS public.sessoes_usuario_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sessao_id VARCHAR(100) UNIQUE NOT NULL,
    usuario_id UUID,
    
    -- Dados da sessão
    inicio_sessao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fim_sessao TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,
    
    -- Atividade
    paginas_visitadas INTEGER DEFAULT 0,
    eventos_gerados INTEGER DEFAULT 0,
    tempo_ativo_segundos INTEGER DEFAULT 0,
    
    -- Dados técnicos
    user_agent TEXT,
    ip_address INET,
    dispositivo VARCHAR(50),
    navegador VARCHAR(50),
    sistema_operacional VARCHAR(50),
    
    -- Localização
    pais VARCHAR(2),
    cidade VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Status
    ativa BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de métricas agregadas diárias
CREATE TABLE IF NOT EXISTS public.metricas_diarias_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_metrica DATE NOT NULL,
    
    -- Métricas de usuários
    usuarios_unicos INTEGER DEFAULT 0,
    usuarios_novos INTEGER DEFAULT 0,
    usuarios_retornando INTEGER DEFAULT 0,
    sessoes_total INTEGER DEFAULT 0,
    
    -- Métricas de engajamento
    tempo_medio_sessao NUMERIC(10,2) DEFAULT 0,
    paginas_por_sessao NUMERIC(5,2) DEFAULT 0,
    taxa_rejeicao NUMERIC(5,4) DEFAULT 0,
    
    -- Métricas de performance
    tempo_carregamento_medio INTEGER DEFAULT 0,
    erros_total INTEGER DEFAULT 0,
    
    -- Métricas por módulo
    modulo_animais_visitas INTEGER DEFAULT 0,
    modulo_equipamentos_visitas INTEGER DEFAULT 0,
    modulo_voluntarios_visitas INTEGER DEFAULT 0,
    modulo_formacao_visitas INTEGER DEFAULT 0,
    
    -- Ações importantes
    equipamentos_criados INTEGER DEFAULT 0,
    animais_registrados INTEGER DEFAULT 0,
    voluntarios_cadastrados INTEGER DEFAULT 0,
    relatorios_gerados INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(data_metrica)
);

-- Função para registrar evento de analytics
CREATE OR REPLACE FUNCTION registrar_evento_analytics(
    p_usuario_id UUID,
    p_sessao_id VARCHAR,
    p_evento VARCHAR,
    p_categoria VARCHAR,
    p_acao VARCHAR,
    p_label VARCHAR DEFAULT NULL,
    p_valor NUMERIC DEFAULT NULL,
    p_pagina_url VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_evento_id UUID;
BEGIN
    INSERT INTO public.analytics_eventos_2025_12_16_12_00 (
        usuario_id, sessao_id, evento, categoria, acao, label, valor,
        pagina_url, metadata
    ) VALUES (
        p_usuario_id, p_sessao_id, p_evento, p_categoria, p_acao, p_label, p_valor,
        p_pagina_url, p_metadata
    ) RETURNING id INTO v_evento_id;
    
    -- Atualizar contador de eventos na sessão
    UPDATE public.sessoes_usuario_2025_12_16_12_00 
    SET eventos_gerados = eventos_gerados + 1,
        updated_at = NOW()
    WHERE sessao_id = p_sessao_id;
    
    RETURN v_evento_id;
END;
$$ LANGUAGE plpgsql;

-- Função para iniciar sessão
CREATE OR REPLACE FUNCTION iniciar_sessao(
    p_sessao_id VARCHAR,
    p_usuario_id UUID DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_sessao_uuid UUID;
BEGIN
    INSERT INTO public.sessoes_usuario_2025_12_16_12_00 (
        sessao_id, usuario_id, user_agent, ip_address
    ) VALUES (
        p_sessao_id, p_usuario_id, p_user_agent, p_ip_address
    ) RETURNING id INTO v_sessao_uuid;
    
    RETURN v_sessao_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para finalizar sessão
CREATE OR REPLACE FUNCTION finalizar_sessao(
    p_sessao_id VARCHAR,
    p_tempo_ativo_segundos INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.sessoes_usuario_2025_12_16_12_00 
    SET fim_sessao = NOW(),
        duracao_segundos = EXTRACT(EPOCH FROM (NOW() - inicio_sessao))::INTEGER,
        tempo_ativo_segundos = COALESCE(p_tempo_ativo_segundos, tempo_ativo_segundos),
        ativa = false,
        updated_at = NOW()
    WHERE sessao_id = p_sessao_id AND ativa = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular métricas diárias
CREATE OR REPLACE FUNCTION calcular_metricas_diarias(p_data DATE DEFAULT CURRENT_DATE) RETURNS VOID AS $$
DECLARE
    v_usuarios_unicos INTEGER;
    v_usuarios_novos INTEGER;
    v_sessoes_total INTEGER;
    v_tempo_medio_sessao NUMERIC;
    v_paginas_por_sessao NUMERIC;
    v_equipamentos_criados INTEGER;
    v_animais_registrados INTEGER;
BEGIN
    -- Calcular métricas básicas
    SELECT COUNT(DISTINCT usuario_id) INTO v_usuarios_unicos
    FROM public.sessoes_usuario_2025_12_16_12_00 
    WHERE DATE(inicio_sessao) = p_data AND usuario_id IS NOT NULL;
    
    SELECT COUNT(*) INTO v_sessoes_total
    FROM public.sessoes_usuario_2025_12_16_12_00 
    WHERE DATE(inicio_sessao) = p_data;
    
    SELECT AVG(duracao_segundos) INTO v_tempo_medio_sessao
    FROM public.sessoes_usuario_2025_12_16_12_00 
    WHERE DATE(inicio_sessao) = p_data AND duracao_segundos IS NOT NULL;
    
    SELECT AVG(paginas_visitadas) INTO v_paginas_por_sessao
    FROM public.sessoes_usuario_2025_12_16_12_00 
    WHERE DATE(inicio_sessao) = p_data;
    
    -- Contar ações importantes
    SELECT COUNT(*) INTO v_equipamentos_criados
    FROM public.equipamentos_2025_12_13_01_00 
    WHERE DATE(created_at) = p_data;
    
    SELECT COUNT(*) INTO v_animais_registrados
    FROM public.animais 
    WHERE DATE(created_at) = p_data;
    
    -- Inserir ou atualizar métricas diárias
    INSERT INTO public.metricas_diarias_2025_12_16_12_00 (
        data_metrica, usuarios_unicos, sessoes_total, tempo_medio_sessao,
        paginas_por_sessao, equipamentos_criados, animais_registrados
    ) VALUES (
        p_data, v_usuarios_unicos, v_sessoes_total, v_tempo_medio_sessao,
        v_paginas_por_sessao, v_equipamentos_criados, v_animais_registrados
    ) ON CONFLICT (data_metrica) DO UPDATE SET
        usuarios_unicos = EXCLUDED.usuarios_unicos,
        sessoes_total = EXCLUDED.sessoes_total,
        tempo_medio_sessao = EXCLUDED.tempo_medio_sessao,
        paginas_por_sessao = EXCLUDED.paginas_por_sessao,
        equipamentos_criados = EXCLUDED.equipamentos_criados,
        animais_registrados = EXCLUDED.animais_registrados;
END;
$$ LANGUAGE plpgsql;

-- Função para obter dashboard de analytics
CREATE OR REPLACE FUNCTION obter_dashboard_analytics(
    p_data_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_data_fim DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    data_metrica DATE,
    usuarios_unicos INTEGER,
    sessoes_total INTEGER,
    tempo_medio_sessao NUMERIC,
    paginas_por_sessao NUMERIC,
    equipamentos_criados INTEGER,
    animais_registrados INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.data_metrica,
        m.usuarios_unicos,
        m.sessoes_total,
        m.tempo_medio_sessao,
        m.paginas_por_sessao,
        m.equipamentos_criados,
        m.animais_registrados
    FROM public.metricas_diarias_2025_12_16_12_00 m
    WHERE m.data_metrica BETWEEN p_data_inicio AND p_data_fim
    ORDER BY m.data_metrica DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar dados antigos de analytics
CREATE OR REPLACE FUNCTION limpar_analytics_antigos() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Deletar eventos de analytics com mais de 90 dias
    DELETE FROM public.analytics_eventos_2025_12_16_12_00 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Deletar métricas de performance com mais de 60 dias
    DELETE FROM public.metricas_performance_2025_12_16_12_00 
    WHERE created_at < NOW() - INTERVAL '60 days';
    
    -- Deletar sessões inativas com mais de 30 dias
    DELETE FROM public.sessoes_usuario_2025_12_16_12_00 
    WHERE ativa = false AND fim_sessao < NOW() - INTERVAL '30 days';
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_usuario_data 
ON public.analytics_eventos_2025_12_16_12_00(usuario_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_eventos_categoria_acao 
ON public.analytics_eventos_2025_12_16_12_00(categoria, acao);

CREATE INDEX IF NOT EXISTS idx_analytics_eventos_sessao 
ON public.analytics_eventos_2025_12_16_12_00(sessao_id);

CREATE INDEX IF NOT EXISTS idx_metricas_performance_pagina 
ON public.metricas_performance_2025_12_16_12_00(pagina, created_at);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_data 
ON public.sessoes_usuario_2025_12_16_12_00(inicio_sessao);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_ativa 
ON public.sessoes_usuario_2025_12_16_12_00(ativa, updated_at);

CREATE INDEX IF NOT EXISTS idx_metricas_diarias_data 
ON public.metricas_diarias_2025_12_16_12_00(data_metrica);

-- RLS (Row Level Security)
ALTER TABLE public.analytics_eventos_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_performance_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_usuario_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_diarias_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (apenas admins podem ver analytics)
CREATE POLICY "Apenas admins veem analytics" ON public.analytics_eventos_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins veem métricas" ON public.metricas_performance_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins veem sessões" ON public.sessoes_usuario_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins veem métricas diárias" ON public.metricas_diarias_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');