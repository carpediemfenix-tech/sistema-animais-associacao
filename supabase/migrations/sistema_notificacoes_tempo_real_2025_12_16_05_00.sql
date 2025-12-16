-- Sistema de Notificações em Tempo Real
-- Criado em: 2025-12-16 05:00 UTC

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes_equipamentos_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    equipamento_id UUID REFERENCES public.equipamentos_2025_12_13_01_00(id) ON DELETE CASCADE,
    tipo_notificacao VARCHAR(50) NOT NULL CHECK (tipo_notificacao IN (
        'manutencao_vencida', 'equipamento_perdido', 'alerta_critico', 
        'devolucao_atrasada', 'manutencao_agendada', 'equipamento_disponivel',
        'relatorio_gerado', 'sistema_atualizado'
    )),
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    lida BOOLEAN DEFAULT FALSE,
    acao_url VARCHAR(500),
    dados_extras JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lida_em TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Tabela de configurações de notificação por usuário
CREATE TABLE IF NOT EXISTS public.configuracoes_notificacoes_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    tipos_habilitados JSONB DEFAULT '["manutencao_vencida", "equipamento_perdido", "alerta_critico", "devolucao_atrasada"]',
    horario_silencioso_inicio TIME DEFAULT '22:00:00',
    horario_silencioso_fim TIME DEFAULT '08:00:00',
    frequencia_resumo VARCHAR(20) DEFAULT 'diario' CHECK (frequencia_resumo IN ('desabilitado', 'diario', 'semanal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes_equipamentos_2025_12_16_05_00(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes_equipamentos_2025_12_16_05_00(tipo_notificacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes_equipamentos_2025_12_16_05_00(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes_equipamentos_2025_12_16_05_00(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON public.notificacoes_equipamentos_2025_12_16_05_00(prioridade);

-- Função para criar notificação automaticamente
CREATE OR REPLACE FUNCTION criar_notificacao_automatica(
    p_usuario_id UUID,
    p_equipamento_id UUID,
    p_tipo VARCHAR(50),
    p_titulo VARCHAR(200),
    p_mensagem TEXT,
    p_prioridade VARCHAR(20) DEFAULT 'media',
    p_acao_url VARCHAR(500) DEFAULT NULL,
    p_dados_extras JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    notificacao_id UUID;
    config_usuario RECORD;
BEGIN
    -- Verificar se o usuário tem este tipo de notificação habilitado
    SELECT * INTO config_usuario 
    FROM public.configuracoes_notificacoes_2025_12_16_05_00 
    WHERE usuario_id = p_usuario_id;
    
    -- Se não tem configuração, criar uma padrão
    IF NOT FOUND THEN
        INSERT INTO public.configuracoes_notificacoes_2025_12_16_05_00 (usuario_id)
        VALUES (p_usuario_id);
        
        SELECT * INTO config_usuario 
        FROM public.configuracoes_notificacoes_2025_12_16_05_00 
        WHERE usuario_id = p_usuario_id;
    END IF;
    
    -- Verificar se o tipo está habilitado
    IF config_usuario.tipos_habilitados ? p_tipo THEN
        -- Criar a notificação
        INSERT INTO public.notificacoes_equipamentos_2025_12_16_05_00 (
            usuario_id, equipamento_id, tipo_notificacao, titulo, mensagem, 
            prioridade, acao_url, dados_extras
        ) VALUES (
            p_usuario_id, p_equipamento_id, p_tipo, p_titulo, p_mensagem,
            p_prioridade, p_acao_url, p_dados_extras
        ) RETURNING id INTO notificacao_id;
        
        RETURN notificacao_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(p_notificacao_id UUID, p_usuario_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notificacoes_equipamentos_2025_12_16_05_00 
    SET lida = TRUE, lida_em = NOW()
    WHERE id = p_notificacao_id AND usuario_id = p_usuario_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION marcar_todas_notificacoes_lidas(p_usuario_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count_updated INTEGER;
BEGIN
    UPDATE public.notificacoes_equipamentos_2025_12_16_05_00 
    SET lida = TRUE, lida_em = NOW()
    WHERE usuario_id = p_usuario_id AND lida = FALSE;
    
    GET DIAGNOSTICS count_updated = ROW_COUNT;
    RETURN count_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificações automáticas quando alertas são criados
CREATE OR REPLACE FUNCTION trigger_notificacao_alerta()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar todos os usuários administradores sobre novos alertas críticos
    IF NEW.prioridade = 'critica' THEN
        INSERT INTO public.notificacoes_equipamentos_2025_12_16_05_00 (
            usuario_id, equipamento_id, tipo_notificacao, titulo, mensagem, prioridade
        )
        SELECT 
            u.id,
            NEW.equipamento_id,
            'alerta_critico',
            'Alerta Crítico: ' || NEW.tipo_alerta,
            NEW.descricao,
            'critica'
        FROM auth.users u
        WHERE u.raw_user_meta_data->>'role' = 'admin';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela de alertas
DROP TRIGGER IF EXISTS trigger_notificacao_alerta ON public.alertas_equipamentos_2025_12_16_07_00;
CREATE TRIGGER trigger_notificacao_alerta
    AFTER INSERT ON public.alertas_equipamentos_2025_12_16_07_00
    FOR EACH ROW EXECUTE FUNCTION trigger_notificacao_alerta();

-- Trigger para notificações de manutenções vencidas
CREATE OR REPLACE FUNCTION trigger_notificacao_manutencao()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar quando manutenção está vencida
    IF NEW.status = 'vencida' AND OLD.status != 'vencida' THEN
        INSERT INTO public.notificacoes_equipamentos_2025_12_16_05_00 (
            usuario_id, equipamento_id, tipo_notificacao, titulo, mensagem, prioridade
        )
        SELECT 
            u.id,
            NEW.equipamento_id,
            'manutencao_vencida',
            'Manutenção Vencida',
            'A manutenção do equipamento ' || e.codigo_interno || ' está vencida desde ' || NEW.data_prevista::date,
            'alta'
        FROM auth.users u, public.equipamentos_2025_12_13_01_00 e
        WHERE e.id = NEW.equipamento_id
        AND u.raw_user_meta_data->>'role' IN ('admin', 'gestor');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela de manutenções
DROP TRIGGER IF EXISTS trigger_notificacao_manutencao ON public.manutencoes_equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_notificacao_manutencao
    AFTER UPDATE ON public.manutencoes_equipamentos_2025_12_13_01_00
    FOR EACH ROW EXECUTE FUNCTION trigger_notificacao_manutencao();

-- View para estatísticas de notificações
CREATE OR REPLACE VIEW public.estatisticas_notificacoes AS
SELECT 
    COUNT(*) as total_notificacoes,
    COUNT(*) FILTER (WHERE lida = FALSE) as nao_lidas,
    COUNT(*) FILTER (WHERE prioridade = 'critica') as criticas,
    COUNT(*) FILTER (WHERE prioridade = 'alta') as altas,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as ultimas_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as ultima_semana
FROM public.notificacoes_equipamentos_2025_12_16_05_00;

-- Políticas RLS
ALTER TABLE public.notificacoes_equipamentos_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_notificacoes_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;

-- Política para notificações - usuários só veem suas próprias notificações
CREATE POLICY "Usuários veem suas notificações" ON public.notificacoes_equipamentos_2025_12_16_05_00
    FOR ALL USING (auth.uid() = usuario_id);

-- Política para configurações - usuários só veem suas próprias configurações
CREATE POLICY "Usuários veem suas configurações" ON public.configuracoes_notificacoes_2025_12_16_05_00
    FOR ALL USING (auth.uid() = usuario_id);

-- Dados de exemplo para demonstração
INSERT INTO public.notificacoes_equipamentos_2025_12_16_05_00 (
    usuario_id, tipo_notificacao, titulo, mensagem, prioridade
) VALUES 
(
    (SELECT id FROM auth.users LIMIT 1),
    'sistema_atualizado',
    'Sistema de Melhorias Implementado',
    'O sistema de equipamentos foi atualizado com novas funcionalidades: notificações em tempo real, melhorias de performance e interface aprimorada.',
    'media'
),
(
    (SELECT id FROM auth.users LIMIT 1),
    'relatorio_gerado',
    'Relatório Mensal Disponível',
    'O relatório mensal de utilização de equipamentos foi gerado e está disponível para download.',
    'baixa'
);

-- Função para limpeza automática de notificações antigas
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS INTEGER AS $$
DECLARE
    count_deleted INTEGER;
BEGIN
    DELETE FROM public.notificacoes_equipamentos_2025_12_16_05_00 
    WHERE expires_at < NOW() OR (lida = TRUE AND created_at < NOW() - INTERVAL '90 days');
    
    GET DIAGNOSTICS count_deleted = ROW_COUNT;
    RETURN count_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;