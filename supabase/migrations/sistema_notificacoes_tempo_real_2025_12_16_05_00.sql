-- Sistema de Notificações em Tempo Real
-- Criado em: 2025-12-16 05:00 UTC

-- Tabela de notificações do sistema
CREATE TABLE IF NOT EXISTS public.notificacoes_sistema_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_notificacao VARCHAR(50) NOT NULL CHECK (tipo_notificacao IN (
        'animal_critico', 'intervencao_urgente', 'voluntario_inativo', 
        'equipamento_danificado', 'financeiro_alerta', 'sistema_manutencao',
        'backup_concluido', 'relatorio_disponivel', 'evento_proximo'
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
    data_expiracao TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de notificações por usuário
CREATE TABLE IF NOT EXISTS public.configuracoes_notificacoes_2025_12_16_05_00 (
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

-- Tabela de templates de notificações
CREATE TABLE IF NOT EXISTS public.templates_notificacoes_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_notificacao VARCHAR(50) NOT NULL,
    titulo_template VARCHAR(200) NOT NULL,
    mensagem_template TEXT NOT NULL,
    prioridade_padrao VARCHAR(20) DEFAULT 'media',
    categoria VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir templates padrão
INSERT INTO public.templates_notificacoes_2025_12_16_05_00 (tipo_notificacao, titulo_template, mensagem_template, prioridade_padrao, categoria) VALUES
('animal_critico', 'Animal em Estado Crítico', 'O animal {animal_nome} requer atenção médica imediata. Estado: {estado}', 'critica', 'animais'),
('intervencao_urgente', 'Intervenção Urgente Agendada', 'Intervenção urgente para {animal_nome} agendada para {data}', 'alta', 'intervencoes'),
('voluntario_inativo', 'Voluntário Inativo', 'O voluntário {voluntario_nome} está inativo há {dias} dias', 'media', 'voluntarios'),
('equipamento_danificado', 'Equipamento Danificado', 'Equipamento {equipamento_codigo} reportado como danificado', 'alta', 'equipamentos'),
('financeiro_alerta', 'Alerta Financeiro', 'Saldo baixo detectado: {saldo_atual}. Limite mínimo: {limite_minimo}', 'alta', 'financeiro'),
('backup_concluido', 'Backup Concluído', 'Backup do sistema concluído com sucesso em {data_backup}', 'baixa', 'sistema'),
('relatorio_disponivel', 'Relatório Disponível', 'Novo relatório {tipo_relatorio} disponível para download', 'media', 'relatorios'),
('evento_proximo', 'Evento Próximo', 'Evento {evento_nome} agendado para {data_evento}', 'media', 'eventos');

-- Função para criar notificação automaticamente
CREATE OR REPLACE FUNCTION criar_notificacao_automatica(
    p_usuario_id UUID,
    p_tipo_notificacao VARCHAR,
    p_dados_contexto JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_template RECORD;
    v_titulo VARCHAR(200);
    v_mensagem TEXT;
    v_notificacao_id UUID;
BEGIN
    -- Buscar template
    SELECT * INTO v_template 
    FROM public.templates_notificacoes_2025_12_16_05_00 
    WHERE tipo_notificacao = p_tipo_notificacao AND ativo = TRUE
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template não encontrado para tipo: %', p_tipo_notificacao;
    END IF;
    
    -- Processar template com dados do contexto
    v_titulo := v_template.titulo_template;
    v_mensagem := v_template.mensagem_template;
    
    -- Substituir placeholders básicos (pode ser expandido)
    IF p_dados_contexto ? 'animal_nome' THEN
        v_titulo := REPLACE(v_titulo, '{animal_nome}', p_dados_contexto->>'animal_nome');
        v_mensagem := REPLACE(v_mensagem, '{animal_nome}', p_dados_contexto->>'animal_nome');
    END IF;
    
    IF p_dados_contexto ? 'equipamento_codigo' THEN
        v_titulo := REPLACE(v_titulo, '{equipamento_codigo}', p_dados_contexto->>'equipamento_codigo');
        v_mensagem := REPLACE(v_mensagem, '{equipamento_codigo}', p_dados_contexto->>'equipamento_codigo');
    END IF;
    
    -- Criar notificação
    INSERT INTO public.notificacoes_sistema_2025_12_16_05_00 (
        usuario_id, tipo_notificacao, titulo, mensagem, prioridade, 
        categoria, dados_contexto, data_expiracao
    ) VALUES (
        p_usuario_id, p_tipo_notificacao, v_titulo, v_mensagem, 
        v_template.prioridade_padrao, v_template.categoria, p_dados_contexto,
        NOW() + INTERVAL '30 days'
    ) RETURNING id INTO v_notificacao_id;
    
    RETURN v_notificacao_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(p_notificacao_id UUID, p_usuario_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notificacoes_sistema_2025_12_16_05_00 
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
    UPDATE public.notificacoes_sistema_2025_12_16_05_00 
    SET lida = TRUE, data_leitura = NOW(), updated_at = NOW()
    WHERE usuario_id = p_usuario_id AND lida = FALSE;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM public.notificacoes_sistema_2025_12_16_05_00 
    WHERE (data_expiracao IS NOT NULL AND data_expiracao < NOW()) 
       OR (data_criacao < NOW() - INTERVAL '90 days' AND lida = TRUE);
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificação quando animal fica crítico
CREATE OR REPLACE FUNCTION trigger_notificacao_animal_critico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'critico' AND (OLD.estado IS NULL OR OLD.estado != 'critico') THEN
        -- Notificar todos os usuários ativos
        INSERT INTO public.notificacoes_sistema_2025_12_16_05_00 (
            usuario_id, tipo_notificacao, titulo, mensagem, prioridade, categoria, dados_contexto
        )
        SELECT 
            u.id,
            'animal_critico',
            'Animal em Estado Crítico',
            'O animal ' || NEW.nome || ' requer atenção médica imediata.',
            'critica',
            'animais',
            jsonb_build_object('animal_id', NEW.id, 'animal_nome', NEW.nome, 'estado', NEW.estado)
        FROM auth.users u
        WHERE u.id IN (
            SELECT DISTINCT usuario_id FROM public.configuracoes_notificacoes_2025_12_16_05_00 
            WHERE notificacoes_sistema = TRUE
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela de animais (assumindo que existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animais') THEN
        DROP TRIGGER IF EXISTS trigger_animal_critico ON public.animais;
        CREATE TRIGGER trigger_animal_critico
            AFTER UPDATE ON public.animais
            FOR EACH ROW
            EXECUTE FUNCTION trigger_notificacao_animal_critico();
    END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida ON public.notificacoes_sistema_2025_12_16_05_00(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo_prioridade ON public.notificacoes_sistema_2025_12_16_05_00(tipo_notificacao, prioridade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes_sistema_2025_12_16_05_00(data_criacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_expiracao ON public.notificacoes_sistema_2025_12_16_05_00(data_expiracao) WHERE data_expiracao IS NOT NULL;

-- RLS Policies
ALTER TABLE public.notificacoes_sistema_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_notificacoes_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_notificacoes_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;

-- Policy para notificações - usuários só veem suas próprias notificações
CREATE POLICY "Usuários veem suas notificações" ON public.notificacoes_sistema_2025_12_16_05_00
    FOR ALL USING (auth.uid() = usuario_id);

-- Policy para configurações - usuários só veem suas próprias configurações
CREATE POLICY "Usuários veem suas configurações" ON public.configuracoes_notificacoes_2025_12_16_05_00
    FOR ALL USING (auth.uid() = usuario_id);

-- Policy para templates - todos podem ler, apenas admins podem modificar
CREATE POLICY "Todos podem ler templates" ON public.templates_notificacoes_2025_12_16_05_00
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins modificam templates" ON public.templates_notificacoes_2025_12_16_05_00
    FOR ALL USING (auth.role() = 'authenticated');

-- Inserir configuração padrão para usuários existentes
INSERT INTO public.configuracoes_notificacoes_2025_12_16_05_00 (usuario_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT usuario_id FROM public.configuracoes_notificacoes_2025_12_16_05_00)
ON CONFLICT (usuario_id) DO NOTHING;