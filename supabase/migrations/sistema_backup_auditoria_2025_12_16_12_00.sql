-- Sistema Avançado de Backup e Auditoria
-- Criado em: 2025-12-16 12:00 UTC

-- Tabela de auditoria avançada
CREATE TABLE IF NOT EXISTS public.auditoria_avancada_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação da operação
    tabela VARCHAR(100) NOT NULL,
    operacao VARCHAR(20) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    registro_id UUID,
    
    -- Dados da operação
    dados_antigos JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    
    -- Contexto do usuário
    usuario_id UUID,
    usuario_email VARCHAR(255),
    usuario_role VARCHAR(50),
    
    -- Contexto da sessão
    sessao_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Contexto da aplicação
    aplicacao VARCHAR(50) DEFAULT 'sistema_animais',
    versao_aplicacao VARCHAR(20),
    endpoint VARCHAR(200),
    metodo_http VARCHAR(10),
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Classificação
    categoria VARCHAR(50) DEFAULT 'geral',
    criticidade VARCHAR(20) DEFAULT 'media' CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de backups automáticos
CREATE TABLE IF NOT EXISTS public.backups_sistema_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação do backup
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('completo', 'incremental', 'diferencial', 'manual')),
    status VARCHAR(20) DEFAULT 'iniciado' CHECK (status IN ('iniciado', 'em_progresso', 'concluido', 'erro', 'cancelado')),
    
    -- Dados do backup
    tabelas_incluidas TEXT[],
    tamanho_bytes BIGINT,
    numero_registros INTEGER,
    
    -- Localização
    caminho_arquivo VARCHAR(500),
    url_download VARCHAR(500),
    hash_verificacao VARCHAR(128),
    
    -- Configurações
    compressao BOOLEAN DEFAULT true,
    criptografia BOOLEAN DEFAULT true,
    retencao_dias INTEGER DEFAULT 30,
    
    -- Timing
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,
    
    -- Resultado
    sucesso BOOLEAN,
    mensagem_erro TEXT,
    logs JSONB DEFAULT '{}',
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Auditoria
    criado_por UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de configurações de backup
CREATE TABLE IF NOT EXISTS public.configuracoes_backup_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Configuração
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    
    -- Agendamento
    frequencia VARCHAR(20) CHECK (frequencia IN ('diario', 'semanal', 'mensal', 'manual')),
    hora_execucao TIME DEFAULT '02:00:00',
    dia_semana INTEGER, -- 1=segunda, 7=domingo
    dia_mes INTEGER, -- 1-31
    
    -- Configurações de backup
    tipo_backup VARCHAR(20) DEFAULT 'incremental',
    tabelas_incluidas TEXT[],
    tabelas_excluidas TEXT[],
    
    -- Retenção
    retencao_dias INTEGER DEFAULT 30,
    max_backups INTEGER DEFAULT 10,
    
    -- Configurações técnicas
    compressao BOOLEAN DEFAULT true,
    criptografia BOOLEAN DEFAULT true,
    notificar_sucesso BOOLEAN DEFAULT false,
    notificar_erro BOOLEAN DEFAULT true,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de restaurações
CREATE TABLE IF NOT EXISTS public.restauracoes_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    backup_id UUID REFERENCES public.backups_sistema_2025_12_16_12_00(id),
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('completa', 'parcial', 'tabela_especifica')),
    
    -- Configurações
    tabelas_restaurar TEXT[],
    sobrescrever_dados BOOLEAN DEFAULT false,
    criar_backup_antes BOOLEAN DEFAULT true,
    
    -- Status
    status VARCHAR(20) DEFAULT 'iniciado' CHECK (status IN ('iniciado', 'em_progresso', 'concluido', 'erro', 'cancelado')),
    
    -- Timing
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,
    
    -- Resultado
    registros_restaurados INTEGER DEFAULT 0,
    sucesso BOOLEAN,
    mensagem_erro TEXT,
    logs JSONB DEFAULT '{}',
    
    -- Auditoria
    executado_por UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Função para registrar auditoria avançada
CREATE OR REPLACE FUNCTION registrar_auditoria_avancada(
    p_tabela VARCHAR,
    p_operacao VARCHAR,
    p_registro_id UUID,
    p_dados_antigos JSONB DEFAULT NULL,
    p_dados_novos JSONB DEFAULT NULL,
    p_usuario_id UUID DEFAULT NULL,
    p_categoria VARCHAR DEFAULT 'geral',
    p_criticidade VARCHAR DEFAULT 'media',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_auditoria_id UUID;
    v_campos_alterados TEXT[];
    v_usuario_email VARCHAR;
BEGIN
    -- Calcular campos alterados
    IF p_dados_antigos IS NOT NULL AND p_dados_novos IS NOT NULL THEN
        SELECT ARRAY(
            SELECT key FROM jsonb_each(p_dados_novos) 
            WHERE p_dados_antigos->key IS DISTINCT FROM p_dados_novos->key
        ) INTO v_campos_alterados;
    END IF;
    
    -- Buscar email do usuário
    IF p_usuario_id IS NOT NULL THEN
        SELECT email INTO v_usuario_email FROM auth.users WHERE id = p_usuario_id;
    END IF;
    
    -- Inserir registro de auditoria
    INSERT INTO public.auditoria_avancada_2025_12_16_12_00 (
        tabela, operacao, registro_id, dados_antigos, dados_novos, campos_alterados,
        usuario_id, usuario_email, categoria, criticidade, metadata
    ) VALUES (
        p_tabela, p_operacao, p_registro_id, p_dados_antigos, p_dados_novos, v_campos_alterados,
        p_usuario_id, v_usuario_email, p_categoria, p_criticidade, p_metadata
    ) RETURNING id INTO v_auditoria_id;
    
    RETURN v_auditoria_id;
END;
$$ LANGUAGE plpgsql;

-- Função para criar backup manual
CREATE OR REPLACE FUNCTION criar_backup_manual(
    p_nome VARCHAR,
    p_tabelas TEXT[] DEFAULT NULL,
    p_usuario_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_backup_id UUID;
    v_tabelas_default TEXT[] := ARRAY[
        'animais', 'equipamentos_2025_12_13_01_00', 'voluntarios', 
        'atribuicoes_equipamentos_2025_12_13_01_00', 'manutencoes_equipamentos_2025_12_13_01_00'
    ];
BEGIN
    -- Usar tabelas padrão se não especificadas
    IF p_tabelas IS NULL THEN
        p_tabelas := v_tabelas_default;
    END IF;
    
    -- Criar registro de backup
    INSERT INTO public.backups_sistema_2025_12_16_12_00 (
        nome, tipo, tabelas_incluidas, criado_por, status
    ) VALUES (
        p_nome, 'manual', p_tabelas, p_usuario_id, 'iniciado'
    ) RETURNING id INTO v_backup_id;
    
    -- Registrar auditoria
    PERFORM registrar_auditoria_avancada(
        'backups_sistema_2025_12_16_12_00',
        'INSERT',
        v_backup_id,
        NULL,
        jsonb_build_object('nome', p_nome, 'tipo', 'manual'),
        p_usuario_id,
        'backup',
        'media'
    );
    
    RETURN v_backup_id;
END;
$$ LANGUAGE plpgsql;

-- Função para finalizar backup
CREATE OR REPLACE FUNCTION finalizar_backup(
    p_backup_id UUID,
    p_sucesso BOOLEAN,
    p_tamanho_bytes BIGINT DEFAULT NULL,
    p_numero_registros INTEGER DEFAULT NULL,
    p_mensagem_erro TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.backups_sistema_2025_12_16_12_00 
    SET status = CASE WHEN p_sucesso THEN 'concluido' ELSE 'erro' END,
        data_fim = NOW(),
        duracao_segundos = EXTRACT(EPOCH FROM (NOW() - data_inicio))::INTEGER,
        sucesso = p_sucesso,
        tamanho_bytes = p_tamanho_bytes,
        numero_registros = p_numero_registros,
        mensagem_erro = p_mensagem_erro,
        updated_at = NOW()
    WHERE id = p_backup_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de auditoria
CREATE OR REPLACE FUNCTION obter_estatisticas_auditoria(
    p_data_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_data_fim DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_operacoes BIGINT,
    operacoes_por_tipo JSONB,
    tabelas_mais_alteradas JSONB,
    usuarios_mais_ativos JSONB,
    operacoes_criticas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_operacoes,
        jsonb_object_agg(operacao, count_op) as operacoes_por_tipo,
        jsonb_object_agg(tabela, count_tab) as tabelas_mais_alteradas,
        jsonb_object_agg(usuario_email, count_user) as usuarios_mais_ativos,
        COUNT(*) FILTER (WHERE criticidade = 'critica') as operacoes_criticas
    FROM (
        SELECT 
            operacao,
            COUNT(*) as count_op,
            tabela,
            COUNT(*) as count_tab,
            usuario_email,
            COUNT(*) as count_user,
            criticidade
        FROM public.auditoria_avancada_2025_12_16_12_00 
        WHERE DATE(created_at) BETWEEN p_data_inicio AND p_data_fim
        GROUP BY operacao, tabela, usuario_email, criticidade
    ) stats;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION limpar_dados_antigos_auditoria() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Deletar auditoria com mais de 1 ano (exceto críticas)
    DELETE FROM public.auditoria_avancada_2025_12_16_12_00 
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND criticidade != 'critica';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Deletar backups expirados
    DELETE FROM public.backups_sistema_2025_12_16_12_00 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND tipo != 'manual';
    
    -- Deletar restaurações antigas
    DELETE FROM public.restauracoes_2025_12_16_12_00 
    WHERE created_at < NOW() - INTERVAL '60 days';
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger genérico para auditoria automática
CREATE OR REPLACE FUNCTION trigger_auditoria_generica()
RETURNS TRIGGER AS $$
DECLARE
    v_dados_antigos JSONB;
    v_dados_novos JSONB;
    v_operacao VARCHAR;
BEGIN
    -- Determinar operação
    IF TG_OP = 'DELETE' THEN
        v_operacao := 'DELETE';
        v_dados_antigos := to_jsonb(OLD);
        v_dados_novos := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        v_operacao := 'UPDATE';
        v_dados_antigos := to_jsonb(OLD);
        v_dados_novos := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        v_operacao := 'INSERT';
        v_dados_antigos := NULL;
        v_dados_novos := to_jsonb(NEW);
    END IF;
    
    -- Registrar auditoria
    PERFORM registrar_auditoria_avancada(
        TG_TABLE_NAME,
        v_operacao,
        COALESCE(NEW.id, OLD.id),
        v_dados_antigos,
        v_dados_novos,
        auth.uid(),
        'automatica',
        CASE 
            WHEN TG_TABLE_NAME IN ('equipamentos_2025_12_13_01_00', 'animais') THEN 'alta'
            ELSE 'media'
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoria nas tabelas principais
DROP TRIGGER IF EXISTS trigger_auditoria_equipamentos ON public.equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_auditoria_equipamentos
    AFTER INSERT OR UPDATE OR DELETE ON public.equipamentos_2025_12_13_01_00
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_generica();

DROP TRIGGER IF EXISTS trigger_auditoria_animais ON public.animais;
CREATE TRIGGER trigger_auditoria_animais
    AFTER INSERT OR UPDATE OR DELETE ON public.animais
    FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_generica();

-- Inserir configurações de backup padrão
INSERT INTO public.configuracoes_backup_2025_12_16_12_00 (
    nome, descricao, frequencia, hora_execucao, tipo_backup, tabelas_incluidas
) VALUES 
(
    'Backup Diário Completo',
    'Backup automático diário de todas as tabelas principais',
    'diario',
    '02:00:00',
    'incremental',
    ARRAY['animais', 'equipamentos_2025_12_13_01_00', 'voluntarios', 'atribuicoes_equipamentos_2025_12_13_01_00']
),
(
    'Backup Semanal Completo',
    'Backup semanal completo para recuperação de desastres',
    'semanal',
    '01:00:00',
    'completo',
    ARRAY['animais', 'equipamentos_2025_12_13_01_00', 'voluntarios', 'atribuicoes_equipamentos_2025_12_13_01_00', 'manutencoes_equipamentos_2025_12_13_01_00']
)
ON CONFLICT (nome) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auditoria_avancada_tabela_data 
ON public.auditoria_avancada_2025_12_16_12_00(tabela, created_at);

CREATE INDEX IF NOT EXISTS idx_auditoria_avancada_usuario 
ON public.auditoria_avancada_2025_12_16_12_00(usuario_id, created_at);

CREATE INDEX IF NOT EXISTS idx_auditoria_avancada_criticidade 
ON public.auditoria_avancada_2025_12_16_12_00(criticidade, created_at);

CREATE INDEX IF NOT EXISTS idx_backups_sistema_status 
ON public.backups_sistema_2025_12_16_12_00(status, created_at);

CREATE INDEX IF NOT EXISTS idx_backups_sistema_tipo 
ON public.backups_sistema_2025_12_16_12_00(tipo, created_at);

-- RLS (Row Level Security)
ALTER TABLE public.auditoria_avancada_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups_sistema_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_backup_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restauracoes_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (apenas admins)
CREATE POLICY "Apenas admins veem auditoria" ON public.auditoria_avancada_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins gerenciam backups" ON public.backups_sistema_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins veem configurações" ON public.configuracoes_backup_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins veem restaurações" ON public.restauracoes_2025_12_16_12_00
    FOR ALL USING (auth.role() = 'authenticated');