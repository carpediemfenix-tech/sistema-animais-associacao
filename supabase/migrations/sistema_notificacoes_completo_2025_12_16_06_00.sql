-- Sistema Completo de Notificações
-- Criado em: 2025-12-16 06:00 UTC

-- Tabela principal de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes_2025_12_16_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_notificacao VARCHAR(50) NOT NULL CHECK (tipo_notificacao IN (
        'animal_critico', 'intervencao_urgente', 'voluntario_inativo', 
        'equipamento_danificado', 'financeiro_alerta', 'sistema_manutencao',
        'backup_concluido', 'relatorio_disponivel', 'evento_proximo',
        'equipamento_criado', 'atribuicao_nova', 'manutencao_agendada'
    )),
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    categoria VARCHAR(50) NOT NULL,
    dados_contexto JSONB DEFAULT '{}',
    lida BOOLEAN DEFAULT FALSE,
    acao_url VARCHAR(500),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_leitura TIMESTAMP WITH TIME ZONE,
    data_expiracao TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de notificações por usuário
CREATE TABLE IF NOT EXISTS public.configuracoes_notificacoes_2025_12_16_06_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    notificacoes_email BOOLEAN DEFAULT TRUE,
    notificacoes_push BOOLEAN DEFAULT TRUE,
    notificacoes_sistema BOOLEAN DEFAULT TRUE,
    tipos_habilitados JSONB DEFAULT '["animal_critico", "intervencao_urgente", "equipamento_danificado"]',
    horario_silencioso_inicio TIME DEFAULT '22:00',
    horario_silencioso_fim TIME DEFAULT '08:00',
    frequencia_resumo VARCHAR(20) DEFAULT 'diario' CHECK (frequencia_resumo IN ('nunca', 'diario', 'semanal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para criar notificação
CREATE OR REPLACE FUNCTION criar_notificacao(
    p_usuario_id UUID,
    p_tipo_notificacao VARCHAR,
    p_titulo VARCHAR,
    p_mensagem TEXT,
    p_prioridade VARCHAR DEFAULT 'media',
    p_categoria VARCHAR DEFAULT 'sistema',
    p_dados_contexto JSONB DEFAULT '{}',
    p_acao_url VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notificacao_id UUID;
BEGIN
    INSERT INTO public.notificacoes_2025_12_16_06_00 (
        usuario_id, tipo_notificacao, titulo, mensagem, prioridade, 
        categoria, dados_contexto, acao_url
    ) VALUES (
        p_usuario_id, p_tipo_notificacao, p_titulo, p_mensagem, 
        p_prioridade, p_categoria, p_dados_contexto, p_acao_url
    ) RETURNING id INTO v_notificacao_id;
    
    RETURN v_notificacao_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(p_notificacao_id UUID, p_usuario_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notificacoes_2025_12_16_06_00 
    SET lida = TRUE, data_leitura = NOW(), updated_at = NOW()
    WHERE id = p_notificacao_id AND usuario_id = p_usuario_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION marcar_todas_notificacoes_lidas(p_usuario_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.notificacoes_2025_12_16_06_00 
    SET lida = TRUE, data_leitura = NOW(), updated_at = NOW()
    WHERE usuario_id = p_usuario_id AND lida = FALSE;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação para todos os usuários
CREATE OR REPLACE FUNCTION criar_notificacao_global(
    p_tipo_notificacao VARCHAR,
    p_titulo VARCHAR,
    p_mensagem TEXT,
    p_prioridade VARCHAR DEFAULT 'media',
    p_categoria VARCHAR DEFAULT 'sistema'
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_user RECORD;
BEGIN
    FOR v_user IN SELECT id FROM auth.users LOOP
        PERFORM criar_notificacao(
            v_user.id, p_tipo_notificacao, p_titulo, p_mensagem, 
            p_prioridade, p_categoria
        );
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificação quando equipamento é criado
CREATE OR REPLACE FUNCTION trigger_notificacao_equipamento_criado()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar notificação para todos os usuários
    PERFORM criar_notificacao_global(
        'equipamento_criado',
        'Novo Equipamento Adicionado',
        'O equipamento ' || NEW.codigo_interno || ' foi adicionado ao inventário.',
        'media',
        'equipamentos'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela de equipamentos
DROP TRIGGER IF EXISTS trigger_equipamento_criado ON public.equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_equipamento_criado
    AFTER INSERT ON public.equipamentos_2025_12_13_01_00
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notificacao_equipamento_criado();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida ON public.notificacoes_2025_12_16_06_00(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo_prioridade ON public.notificacoes_2025_12_16_06_00(tipo_notificacao, prioridade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes_2025_12_16_06_00(data_criacao);

-- RLS Policies
ALTER TABLE public.notificacoes_2025_12_16_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_notificacoes_2025_12_16_06_00 ENABLE ROW LEVEL SECURITY;

-- Policy para notificações - usuários só veem suas próprias notificações
CREATE POLICY "Usuários veem suas notificações" ON public.notificacoes_2025_12_16_06_00
    FOR ALL USING (auth.uid() = usuario_id);

-- Policy para configurações - usuários só veem suas próprias configurações
CREATE POLICY "Usuários veem suas configurações" ON public.configuracoes_notificacoes_2025_12_16_06_00
    FOR ALL USING (auth.uid() = usuario_id);

-- Inserir configuração padrão para usuários existentes
INSERT INTO public.configuracoes_notificacoes_2025_12_16_06_00 (usuario_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT usuario_id FROM public.configuracoes_notificacoes_2025_12_16_06_00)
ON CONFLICT (usuario_id) DO NOTHING;

-- Criar algumas notificações de exemplo
INSERT INTO public.notificacoes_2025_12_16_06_00 (
    usuario_id, tipo_notificacao, titulo, mensagem, prioridade, categoria
) 
SELECT 
    u.id,
    'sistema_manutencao',
    'Sistema Atualizado',
    'O sistema foi atualizado com novas funcionalidades de notificações.',
    'media',
    'sistema'
FROM auth.users u
LIMIT 1;