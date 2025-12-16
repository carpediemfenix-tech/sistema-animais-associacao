-- Sistema de Auditoria e Backup Avançado
-- Criado em: 2025-12-16 05:00 UTC

-- Tabela de auditoria do sistema
CREATE TABLE IF NOT EXISTS public.auditoria_sistema_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id),
    tabela_afetada VARCHAR(100) NOT NULL,
    operacao VARCHAR(20) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    registro_id VARCHAR(100),
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    sessao_id VARCHAR(100),
    modulo VARCHAR(50),
    acao_descricao TEXT,
    nivel_criticidade VARCHAR(20) DEFAULT 'info' CHECK (nivel_criticidade IN ('info', 'warning', 'error', 'critical')),
    metadata JSONB DEFAULT '{}',
    timestamp_operacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de backups do sistema
CREATE TABLE IF NOT EXISTS public.backups_sistema_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_backup VARCHAR(50) NOT NULL CHECK (tipo_backup IN ('completo', 'incremental', 'diferencial', 'manual')),
    status VARCHAR(20) DEFAULT 'iniciado' CHECK (status IN ('iniciado', 'em_progresso', 'concluido', 'erro', 'cancelado')),
    tabelas_incluidas TEXT[],
    tamanho_bytes BIGINT,
    localizacao_arquivo VARCHAR(500),
    hash_verificacao VARCHAR(128),
    usuario_solicitante UUID REFERENCES auth.users(id),
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_conclusao TIMESTAMP WITH TIME ZONE,
    tempo_duracao INTERVAL,
    observacoes TEXT,
    erro_detalhes TEXT,
    versao_sistema VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.configuracoes_sistema_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo_valor VARCHAR(20) DEFAULT 'string' CHECK (tipo_valor IN ('string', 'number', 'boolean', 'json')),
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    valor_padrao TEXT,
    requer_reinicio BOOLEAN DEFAULT FALSE,
    nivel_acesso VARCHAR(20) DEFAULT 'admin' CHECK (nivel_acesso IN ('public', 'user', 'admin', 'system')),
    ultima_modificacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modificado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão do sistema
INSERT INTO public.configuracoes_sistema_2025_12_16_05_00 (chave, valor, tipo_valor, categoria, descricao, valor_padrao) VALUES
('backup_automatico_habilitado', 'true', 'boolean', 'backup', 'Habilitar backups automáticos', 'true'),
('backup_frequencia_horas', '24', 'number', 'backup', 'Frequência de backup em horas', '24'),
('backup_retencao_dias', '30', 'number', 'backup', 'Dias de retenção de backups', '30'),
('auditoria_habilitada', 'true', 'boolean', 'auditoria', 'Habilitar auditoria do sistema', 'true'),
('auditoria_nivel_minimo', 'info', 'string', 'auditoria', 'Nível mínimo de auditoria', 'info'),
('notificacoes_tempo_real', 'true', 'boolean', 'notificacoes', 'Habilitar notificações em tempo real', 'true'),
('manutencao_modo', 'false', 'boolean', 'sistema', 'Modo de manutenção ativo', 'false'),
('versao_sistema', '2.1.0', 'string', 'sistema', 'Versão atual do sistema', '2.1.0'),
('limite_sessao_minutos', '480', 'number', 'seguranca', 'Limite de sessão em minutos', '480'),
('tentativas_login_max', '5', 'number', 'seguranca', 'Máximo de tentativas de login', '5')
ON CONFLICT (chave) DO NOTHING;

-- Função para registrar auditoria
CREATE OR REPLACE FUNCTION registrar_auditoria(
    p_tabela VARCHAR,
    p_operacao VARCHAR,
    p_registro_id VARCHAR DEFAULT NULL,
    p_dados_anteriores JSONB DEFAULT NULL,
    p_dados_novos JSONB DEFAULT NULL,
    p_modulo VARCHAR DEFAULT NULL,
    p_acao_descricao TEXT DEFAULT NULL,
    p_nivel_criticidade VARCHAR DEFAULT 'info'
) RETURNS UUID AS $$
DECLARE
    v_auditoria_id UUID;
    v_usuario_id UUID;
BEGIN
    -- Obter usuário atual
    v_usuario_id := auth.uid();
    
    -- Inserir registro de auditoria
    INSERT INTO public.auditoria_sistema_2025_12_16_05_00 (
        usuario_id, tabela_afetada, operacao, registro_id, 
        dados_anteriores, dados_novos, modulo, acao_descricao, nivel_criticidade
    ) VALUES (
        v_usuario_id, p_tabela, p_operacao, p_registro_id,
        p_dados_anteriores, p_dados_novos, p_modulo, p_acao_descricao, p_nivel_criticidade
    ) RETURNING id INTO v_auditoria_id;
    
    RETURN v_auditoria_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar backup manual
CREATE OR REPLACE FUNCTION criar_backup_manual(
    p_tipo_backup VARCHAR DEFAULT 'manual',
    p_tabelas TEXT[] DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_backup_id UUID;
    v_usuario_id UUID;
    v_versao_sistema VARCHAR;
BEGIN
    v_usuario_id := auth.uid();
    
    -- Obter versão do sistema
    SELECT valor INTO v_versao_sistema 
    FROM public.configuracoes_sistema_2025_12_16_05_00 
    WHERE chave = 'versao_sistema';
    
    -- Criar registro de backup
    INSERT INTO public.backups_sistema_2025_12_16_05_00 (
        tipo_backup, status, tabelas_incluidas, usuario_solicitante, 
        observacoes, versao_sistema
    ) VALUES (
        p_tipo_backup, 'iniciado', p_tabelas, v_usuario_id,
        p_observacoes, v_versao_sistema
    ) RETURNING id INTO v_backup_id;
    
    -- Registrar auditoria
    PERFORM registrar_auditoria(
        'backups_sistema_2025_12_16_05_00', 
        'INSERT', 
        v_backup_id::TEXT,
        NULL,
        jsonb_build_object('tipo_backup', p_tipo_backup, 'usuario', v_usuario_id),
        'backup',
        'Backup manual iniciado',
        'info'
    );
    
    RETURN v_backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter histórico de um registro
CREATE OR REPLACE FUNCTION obter_historico_registro(
    p_tabela VARCHAR,
    p_registro_id VARCHAR,
    p_limite INTEGER DEFAULT 50
) RETURNS TABLE (
    id UUID,
    operacao VARCHAR,
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_nome TEXT,
    timestamp_operacao TIMESTAMP WITH TIME ZONE,
    acao_descricao TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.operacao,
        a.dados_anteriores,
        a.dados_novos,
        COALESCE(u.email, 'Sistema') as usuario_nome,
        a.timestamp_operacao,
        a.acao_descricao
    FROM public.auditoria_sistema_2025_12_16_05_00 a
    LEFT JOIN auth.users u ON a.usuario_id = u.id
    WHERE a.tabela_afetada = p_tabela 
      AND a.registro_id = p_registro_id
    ORDER BY a.timestamp_operacao DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de auditoria
CREATE OR REPLACE FUNCTION estatisticas_auditoria(
    p_data_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_data_fim DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_operacoes BIGINT,
    operacoes_por_tipo JSONB,
    usuarios_mais_ativos JSONB,
    tabelas_mais_modificadas JSONB,
    operacoes_criticas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_operacoes,
        jsonb_object_agg(operacao, count_op) as operacoes_por_tipo,
        jsonb_object_agg(usuario_email, user_ops) as usuarios_mais_ativos,
        jsonb_object_agg(tabela_afetada, table_ops) as tabelas_mais_modificadas,
        COUNT(*) FILTER (WHERE nivel_criticidade IN ('error', 'critical')) as operacoes_criticas
    FROM (
        SELECT 
            a.operacao,
            COUNT(*) as count_op,
            COALESCE(u.email, 'Sistema') as usuario_email,
            COUNT(*) OVER (PARTITION BY a.usuario_id) as user_ops,
            a.tabela_afetada,
            COUNT(*) OVER (PARTITION BY a.tabela_afetada) as table_ops,
            a.nivel_criticidade
        FROM public.auditoria_sistema_2025_12_16_05_00 a
        LEFT JOIN auth.users u ON a.usuario_id = u.id
        WHERE DATE(a.timestamp_operacao) BETWEEN p_data_inicio AND p_data_fim
    ) stats
    GROUP BY operacao, usuario_email, tabela_afetada, nivel_criticidade;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar auditoria antiga
CREATE OR REPLACE FUNCTION limpar_auditoria_antiga(p_dias_retencao INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM public.auditoria_sistema_2025_12_16_05_00 
    WHERE timestamp_operacao < NOW() - (p_dias_retencao || ' days')::INTERVAL
      AND nivel_criticidade NOT IN ('error', 'critical');
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Registrar limpeza
    PERFORM registrar_auditoria(
        'auditoria_sistema_2025_12_16_05_00',
        'DELETE',
        NULL,
        NULL,
        jsonb_build_object('registros_removidos', v_count, 'dias_retencao', p_dias_retencao),
        'sistema',
        'Limpeza automática de auditoria',
        'info'
    );
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger genérico para auditoria automática
CREATE OR REPLACE FUNCTION trigger_auditoria_generica()
RETURNS TRIGGER AS $$
DECLARE
    v_dados_anteriores JSONB;
    v_dados_novos JSONB;
    v_operacao VARCHAR;
BEGIN
    -- Determinar operação e dados
    IF TG_OP = 'DELETE' THEN
        v_operacao := 'DELETE';
        v_dados_anteriores := to_jsonb(OLD);
        v_dados_novos := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_operacao := 'UPDATE';
        v_dados_anteriores := to_jsonb(OLD);
        v_dados_novos := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        v_operacao := 'INSERT';
        v_dados_anteriores := NULL;
        v_dados_novos := to_jsonb(NEW);
    END IF;
    
    -- Registrar auditoria
    PERFORM registrar_auditoria(
        TG_TABLE_NAME,
        v_operacao,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        v_dados_anteriores,
        v_dados_novos,
        'sistema',
        'Operação automática na tabela ' || TG_TABLE_NAME,
        'info'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_timestamp ON public.auditoria_sistema_2025_12_16_05_00(usuario_id, timestamp_operacao);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela_registro ON public.auditoria_sistema_2025_12_16_05_00(tabela_afetada, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_operacao_nivel ON public.auditoria_sistema_2025_12_16_05_00(operacao, nivel_criticidade);
CREATE INDEX IF NOT EXISTS idx_backups_status_data ON public.backups_sistema_2025_12_16_05_00(status, data_inicio);
CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON public.configuracoes_sistema_2025_12_16_05_00(categoria);

-- RLS Policies
ALTER TABLE public.auditoria_sistema_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups_sistema_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;

-- Policy para auditoria - apenas usuários autenticados podem ver
CREATE POLICY "Usuários autenticados veem auditoria" ON public.auditoria_sistema_2025_12_16_05_00
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy para backups - apenas usuários autenticados podem ver
CREATE POLICY "Usuários autenticados veem backups" ON public.backups_sistema_2025_12_16_05_00
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy para configurações - apenas usuários autenticados podem ver
CREATE POLICY "Usuários autenticados veem configurações" ON public.configuracoes_sistema_2025_12_16_05_00
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados modificam configurações" ON public.configuracoes_sistema_2025_12_16_05_00
    FOR ALL USING (auth.role() = 'authenticated');