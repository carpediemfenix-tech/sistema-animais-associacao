-- Sistema Avançado de Notificações em Tempo Real
-- Criado em: 2025-12-16 12:00 UTC

-- Tabela de tipos de notificação
CREATE TABLE IF NOT EXISTS public.tipos_notificacoes_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(20),
    som_notificacao VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de notificações avançada
CREATE TABLE IF NOT EXISTS public.notificacoes_avancadas_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_id UUID REFERENCES public.tipos_notificacoes_2025_12_16_12_00(id),
    usuario_id UUID,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica', 'urgente')),
    categoria VARCHAR(50) DEFAULT 'geral',
    
    -- Dados contextuais
    entidade_tipo VARCHAR(50), -- 'equipamento', 'animal', 'voluntario', etc.
    entidade_id UUID,
    
    -- URLs e ações
    acao_url VARCHAR(500),
    acao_texto VARCHAR(100),
    acao_tipo VARCHAR(50), -- 'link', 'modal', 'page', 'api'
    
    -- Configurações de exibição
    auto_dismiss BOOLEAN DEFAULT false,
    dismiss_timeout INTEGER DEFAULT 0, -- segundos, 0 = não dismiss automático
    som_ativo BOOLEAN DEFAULT true,
    
    -- Status e controle
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    arquivada BOOLEAN DEFAULT false,
    data_arquivamento TIMESTAMP WITH TIME ZONE,
    
    -- Agendamento
    agendada_para TIMESTAMP WITH TIME ZONE,
    enviada BOOLEAN DEFAULT false,
    data_envio TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Auditoria
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de configurações de notificação por usuário
CREATE TABLE IF NOT EXISTS public.configuracoes_notificacoes_usuario_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    tipo_notificacao_id UUID REFERENCES public.tipos_notificacoes_2025_12_16_12_00(id),
    
    -- Configurações de recebimento
    ativo BOOLEAN DEFAULT true,
    email_ativo BOOLEAN DEFAULT true,
    push_ativo BOOLEAN DEFAULT true,
    som_ativo BOOLEAN DEFAULT true,
    
    -- Configurações de prioridade
    prioridade_minima VARCHAR(20) DEFAULT 'baixa',
    
    -- Configurações de horário
    horario_inicio TIME DEFAULT '08:00:00',
    horario_fim TIME DEFAULT '22:00:00',
    dias_semana INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=segunda, 7=domingo
    
    -- Configurações de agrupamento
    agrupar_similares BOOLEAN DEFAULT true,
    intervalo_agrupamento INTEGER DEFAULT 300, -- segundos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(usuario_id, tipo_notificacao_id)
);

-- Tabela de histórico de notificações
CREATE TABLE IF NOT EXISTS public.historico_notificacoes_2025_12_16_12_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notificacao_id UUID REFERENCES public.notificacoes_avancadas_2025_12_16_12_00(id),
    acao VARCHAR(50) NOT NULL, -- 'criada', 'lida', 'arquivada', 'clicada', 'dismissed'
    usuario_id UUID,
    data_acao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Inserir tipos de notificação padrão
INSERT INTO public.tipos_notificacoes_2025_12_16_12_00 (codigo, nome, descricao, icone, cor) VALUES
('EQUIPAMENTO_NOVO', 'Novo Equipamento', 'Notificação quando um novo equipamento é adicionado', 'Package', 'blue'),
('EQUIPAMENTO_MANUTENCAO', 'Manutenção de Equipamento', 'Alertas sobre manutenções programadas ou necessárias', 'Wrench', 'orange'),
('EQUIPAMENTO_GARANTIA', 'Garantia Vencendo', 'Alerta quando garantia está próxima do vencimento', 'Clock', 'yellow'),
('ATRIBUICAO_NOVA', 'Nova Atribuição', 'Notificação de nova atribuição de equipamento', 'UserPlus', 'green'),
('ATRIBUICAO_VENCIDA', 'Atribuição Vencida', 'Alerta de atribuição com prazo vencido', 'AlertTriangle', 'red'),
('SISTEMA_BACKUP', 'Backup do Sistema', 'Notificações sobre backups automáticos', 'Database', 'purple'),
('SISTEMA_ERRO', 'Erro do Sistema', 'Alertas sobre erros críticos do sistema', 'AlertCircle', 'red'),
('ANIMAL_NOVO', 'Novo Animal', 'Notificação quando um novo animal é registrado', 'Heart', 'pink'),
('VOLUNTARIO_NOVO', 'Novo Voluntário', 'Notificação quando um novo voluntário se registra', 'Users', 'cyan'),
('RELATORIO_PRONTO', 'Relatório Disponível', 'Notificação quando um relatório está pronto', 'FileText', 'indigo')
ON CONFLICT (codigo) DO NOTHING;

-- Função para criar notificação avançada
CREATE OR REPLACE FUNCTION criar_notificacao_avancada(
    p_tipo_codigo VARCHAR,
    p_usuario_id UUID,
    p_titulo VARCHAR,
    p_mensagem TEXT,
    p_prioridade VARCHAR DEFAULT 'media',
    p_categoria VARCHAR DEFAULT 'geral',
    p_entidade_tipo VARCHAR DEFAULT NULL,
    p_entidade_id UUID DEFAULT NULL,
    p_acao_url VARCHAR DEFAULT NULL,
    p_acao_texto VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_tipo_id UUID;
    v_notificacao_id UUID;
BEGIN
    -- Buscar tipo de notificação
    SELECT id INTO v_tipo_id 
    FROM public.tipos_notificacoes_2025_12_16_12_00 
    WHERE codigo = p_tipo_codigo AND ativo = true;
    
    IF v_tipo_id IS NULL THEN
        RAISE EXCEPTION 'Tipo de notificação não encontrado: %', p_tipo_codigo;
    END IF;
    
    -- Verificar se usuário quer receber este tipo de notificação
    IF EXISTS (
        SELECT 1 FROM public.configuracoes_notificacoes_usuario_2025_12_16_12_00 
        WHERE usuario_id = p_usuario_id 
        AND tipo_notificacao_id = v_tipo_id 
        AND ativo = false
    ) THEN
        RETURN NULL; -- Usuário não quer receber
    END IF;
    
    -- Criar notificação
    INSERT INTO public.notificacoes_avancadas_2025_12_16_12_00 (
        tipo_id, usuario_id, titulo, mensagem, prioridade, categoria,
        entidade_tipo, entidade_id, acao_url, acao_texto, metadata,
        enviada, data_envio
    ) VALUES (
        v_tipo_id, p_usuario_id, p_titulo, p_mensagem, p_prioridade, p_categoria,
        p_entidade_tipo, p_entidade_id, p_acao_url, p_acao_texto, p_metadata,
        true, NOW()
    ) RETURNING id INTO v_notificacao_id;
    
    -- Registrar no histórico
    INSERT INTO public.historico_notificacoes_2025_12_16_12_00 (
        notificacao_id, acao, usuario_id, metadata
    ) VALUES (
        v_notificacao_id, 'criada', p_usuario_id, p_metadata
    );
    
    RETURN v_notificacao_id;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida_avancada(
    p_notificacao_id UUID,
    p_usuario_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notificacoes_avancadas_2025_12_16_12_00 
    SET lida = true, data_leitura = NOW(), updated_at = NOW()
    WHERE id = p_notificacao_id AND usuario_id = p_usuario_id AND lida = false;
    
    IF FOUND THEN
        INSERT INTO public.historico_notificacoes_2025_12_16_12_00 (
            notificacao_id, acao, usuario_id
        ) VALUES (
            p_notificacao_id, 'lida', p_usuario_id
        );
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Função para arquivar notificação
CREATE OR REPLACE FUNCTION arquivar_notificacao(
    p_notificacao_id UUID,
    p_usuario_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notificacoes_avancadas_2025_12_16_12_00 
    SET arquivada = true, data_arquivamento = NOW(), updated_at = NOW()
    WHERE id = p_notificacao_id AND usuario_id = p_usuario_id;
    
    IF FOUND THEN
        INSERT INTO public.historico_notificacoes_2025_12_16_12_00 (
            notificacao_id, acao, usuario_id
        ) VALUES (
            p_notificacao_id, 'arquivada', p_usuario_id
        );
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas() RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Arquivar notificações lidas há mais de 30 dias
    UPDATE public.notificacoes_avancadas_2025_12_16_12_00 
    SET arquivada = true, data_arquivamento = NOW()
    WHERE lida = true 
    AND data_leitura < NOW() - INTERVAL '30 days'
    AND arquivada = false;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Deletar notificações arquivadas há mais de 90 dias
    DELETE FROM public.notificacoes_avancadas_2025_12_16_12_00 
    WHERE arquivada = true 
    AND data_arquivamento < NOW() - INTERVAL '90 days';
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificação quando equipamento é criado
CREATE OR REPLACE FUNCTION trigger_notificacao_equipamento_criado()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar notificação para todos os usuários admin
    INSERT INTO public.notificacoes_avancadas_2025_12_16_12_00 (
        tipo_id,
        titulo,
        mensagem,
        prioridade,
        categoria,
        entidade_tipo,
        entidade_id,
        acao_url,
        acao_texto,
        enviada,
        data_envio
    )
    SELECT 
        t.id,
        'Novo equipamento adicionado',
        'Equipamento ' || NEW.codigo_interno || ' foi adicionado ao sistema',
        'media',
        'equipamentos',
        'equipamento',
        NEW.id,
        '/equipamentos/inventario',
        'Ver Equipamento',
        true,
        NOW()
    FROM public.tipos_notificacoes_2025_12_16_12_00 t
    WHERE t.codigo = 'EQUIPAMENTO_NOVO';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela de equipamentos
DROP TRIGGER IF EXISTS trigger_equipamento_criado ON public.equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_equipamento_criado
    AFTER INSERT ON public.equipamentos_2025_12_13_01_00
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notificacao_equipamento_criado();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_avancadas_usuario_lida 
ON public.notificacoes_avancadas_2025_12_16_12_00(usuario_id, lida);

CREATE INDEX IF NOT EXISTS idx_notificacoes_avancadas_prioridade 
ON public.notificacoes_avancadas_2025_12_16_12_00(prioridade);

CREATE INDEX IF NOT EXISTS idx_notificacoes_avancadas_categoria 
ON public.notificacoes_avancadas_2025_12_16_12_00(categoria);

CREATE INDEX IF NOT EXISTS idx_notificacoes_avancadas_entidade 
ON public.notificacoes_avancadas_2025_12_16_12_00(entidade_tipo, entidade_id);

CREATE INDEX IF NOT EXISTS idx_historico_notificacoes_data 
ON public.historico_notificacoes_2025_12_16_12_00(data_acao);

-- RLS (Row Level Security)
ALTER TABLE public.tipos_notificacoes_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_avancadas_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_notificacoes_usuario_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_notificacoes_2025_12_16_12_00 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Tipos de notificação são públicos" ON public.tipos_notificacoes_2025_12_16_12_00
    FOR SELECT USING (true);

CREATE POLICY "Usuários veem suas notificações" ON public.notificacoes_avancadas_2025_12_16_12_00
    FOR ALL USING (auth.uid()::text = usuario_id::text OR usuario_id IS NULL);

CREATE POLICY "Usuários gerenciam suas configurações" ON public.configuracoes_notificacoes_usuario_2025_12_16_12_00
    FOR ALL USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários veem seu histórico" ON public.historico_notificacoes_2025_12_16_12_00
    FOR SELECT USING (auth.uid()::text = usuario_id::text);