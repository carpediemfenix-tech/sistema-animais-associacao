-- Sistema de Auditoria e Backup Avançado
-- Criado em: 2025-12-16 05:00 UTC

-- Tabela de auditoria para todas as operações
CREATE TABLE IF NOT EXISTS public.auditoria_equipamentos_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tabela_nome VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    operacao VARCHAR(20) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id UUID REFERENCES auth.users(id),
    dados_antigos JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    ip_address INET,
    user_agent TEXT,
    sessao_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de backup automático
CREATE TABLE IF NOT EXISTS public.backup_equipamentos_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_backup VARCHAR(50) NOT NULL CHECK (tipo_backup IN ('diario', 'semanal', 'mensal', 'manual')),
    tabelas_incluidas TEXT[] NOT NULL,
    total_registros INTEGER NOT NULL,
    tamanho_mb DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'em_progresso' CHECK (status IN ('em_progresso', 'concluido', 'erro')),
    arquivo_path VARCHAR(500),
    checksum VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    erro_detalhes TEXT
);

-- Tabela de configurações de sistema
CREATE TABLE IF NOT EXISTS public.configuracoes_sistema_2025_12_16_05_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) DEFAULT 'geral',
    editavel BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela_registro ON public.auditoria_equipamentos_2025_12_16_05_00(tabela_nome, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria_equipamentos_2025_12_16_05_00(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.auditoria_equipamentos_2025_12_16_05_00(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_tipo_status ON public.backup_equipamentos_2025_12_16_05_00(tipo_backup, status);
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON public.configuracoes_sistema_2025_12_16_05_00(chave);

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    campos_alterados TEXT[] := '{}';
    campo TEXT;
    dados_antigos JSONB;
    dados_novos JSONB;
BEGIN
    -- Determinar dados antigos e novos baseado na operação
    IF TG_OP = 'DELETE' THEN
        dados_antigos := to_jsonb(OLD);
        dados_novos := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        dados_antigos := NULL;
        dados_novos := to_jsonb(NEW);
    ELSE -- UPDATE
        dados_antigos := to_jsonb(OLD);
        dados_novos := to_jsonb(NEW);
        
        -- Identificar campos alterados
        FOR campo IN SELECT key FROM jsonb_each(dados_novos) LOOP
            IF dados_antigos->campo IS DISTINCT FROM dados_novos->campo THEN
                campos_alterados := array_append(campos_alterados, campo);
            END IF;
        END LOOP;
    END IF;
    
    -- Inserir registro de auditoria
    INSERT INTO public.auditoria_equipamentos_2025_12_16_05_00 (
        tabela_nome, registro_id, operacao, usuario_id, 
        dados_antigos, dados_novos, campos_alterados
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        dados_antigos,
        dados_novos,
        campos_alterados
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoria nas tabelas principais
DROP TRIGGER IF EXISTS trigger_auditoria_equipamentos ON public.equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_auditoria_equipamentos
    AFTER INSERT OR UPDATE OR DELETE ON public.equipamentos_2025_12_13_01_00
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

DROP TRIGGER IF EXISTS trigger_auditoria_atribuicoes ON public.atribuicoes_equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_auditoria_atribuicoes
    AFTER INSERT OR UPDATE OR DELETE ON public.atribuicoes_equipamentos_2025_12_13_01_00
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

DROP TRIGGER IF EXISTS trigger_auditoria_manutencoes ON public.manutencoes_equipamentos_2025_12_13_01_00;
CREATE TRIGGER trigger_auditoria_manutencoes
    AFTER INSERT OR UPDATE OR DELETE ON public.manutencoes_equipamentos_2025_12_13_01_00
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

DROP TRIGGER IF EXISTS trigger_auditoria_alertas ON public.alertas_equipamentos_2025_12_16_07_00;
CREATE TRIGGER trigger_auditoria_alertas
    AFTER INSERT OR UPDATE OR DELETE ON public.alertas_equipamentos_2025_12_16_07_00
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Função para criar backup manual
CREATE OR REPLACE FUNCTION criar_backup_manual(p_tabelas TEXT[] DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    backup_id UUID;
    tabelas_backup TEXT[];
    total_registros INTEGER := 0;
    registro_count INTEGER;
    tabela TEXT;
BEGIN
    -- Definir tabelas padrão se não especificadas
    IF p_tabelas IS NULL THEN
        tabelas_backup := ARRAY[
            'equipamentos_2025_12_13_01_00',
            'atribuicoes_equipamentos_2025_12_13_01_00',
            'manutencoes_equipamentos_2025_12_13_01_00',
            'alertas_equipamentos_2025_12_16_07_00',
            'notificacoes_equipamentos_2025_12_16_05_00'
        ];
    ELSE
        tabelas_backup := p_tabelas;
    END IF;
    
    -- Contar total de registros
    FOREACH tabela IN ARRAY tabelas_backup LOOP
        EXECUTE format('SELECT COUNT(*) FROM public.%I', tabela) INTO registro_count;
        total_registros := total_registros + registro_count;
    END LOOP;
    
    -- Criar registro de backup
    INSERT INTO public.backup_equipamentos_2025_12_16_05_00 (
        tipo_backup, tabelas_incluidas, total_registros, status
    ) VALUES (
        'manual', tabelas_backup, total_registros, 'concluido'
    ) RETURNING id INTO backup_id;
    
    -- Atualizar com timestamp de conclusão
    UPDATE public.backup_equipamentos_2025_12_16_05_00 
    SET completed_at = NOW() 
    WHERE id = backup_id;
    
    RETURN backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter histórico de um registro
CREATE OR REPLACE FUNCTION obter_historico_registro(
    p_tabela VARCHAR(100), 
    p_registro_id UUID,
    p_limite INTEGER DEFAULT 50
)
RETURNS TABLE (
    operacao VARCHAR(20),
    usuario_email TEXT,
    campos_alterados TEXT[],
    dados_antigos JSONB,
    dados_novos JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.operacao,
        u.email as usuario_email,
        a.campos_alterados,
        a.dados_antigos,
        a.dados_novos,
        a.created_at
    FROM public.auditoria_equipamentos_2025_12_16_05_00 a
    LEFT JOIN auth.users u ON a.usuario_id = u.id
    WHERE a.tabela_nome = p_tabela AND a.registro_id = p_registro_id
    ORDER BY a.created_at DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de auditoria
CREATE OR REPLACE FUNCTION estatisticas_auditoria(p_dias INTEGER DEFAULT 30)
RETURNS TABLE (
    tabela_nome VARCHAR(100),
    total_operacoes BIGINT,
    inserts BIGINT,
    updates BIGINT,
    deletes BIGINT,
    usuarios_unicos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.tabela_nome,
        COUNT(*) as total_operacoes,
        COUNT(*) FILTER (WHERE a.operacao = 'INSERT') as inserts,
        COUNT(*) FILTER (WHERE a.operacao = 'UPDATE') as updates,
        COUNT(*) FILTER (WHERE a.operacao = 'DELETE') as deletes,
        COUNT(DISTINCT a.usuario_id) as usuarios_unicos
    FROM public.auditoria_equipamentos_2025_12_16_05_00 a
    WHERE a.created_at >= NOW() - (p_dias || ' days')::INTERVAL
    GROUP BY a.tabela_nome
    ORDER BY total_operacoes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir configurações padrão do sistema
INSERT INTO public.configuracoes_sistema_2025_12_16_05_00 (chave, valor, descricao, categoria) VALUES
('backup_automatico_habilitado', 'true', 'Habilitar backup automático diário', 'backup'),
('backup_retencao_dias', '90', 'Dias para manter backups antigos', 'backup'),
('auditoria_detalhada', 'true', 'Registrar auditoria detalhada de todas as operações', 'auditoria'),
('notificacoes_tempo_real', 'true', 'Habilitar notificações em tempo real', 'notificacoes'),
('manutencao_alerta_dias', '7', 'Dias de antecedência para alertas de manutenção', 'manutencao'),
('dashboard_refresh_segundos', '30', 'Intervalo de atualização do dashboard em segundos', 'interface'),
('relatorios_cache_minutos', '15', 'Tempo de cache dos relatórios em minutos', 'performance'),
('max_equipamentos_por_usuario', '10', 'Máximo de equipamentos que um usuário pode ter simultaneamente', 'limites')
ON CONFLICT (chave) DO NOTHING;

-- View para configurações ativas
CREATE OR REPLACE VIEW public.configuracoes_ativas AS
SELECT 
    chave,
    valor,
    descricao,
    categoria,
    updated_at
FROM public.configuracoes_sistema_2025_12_16_05_00
WHERE editavel = TRUE
ORDER BY categoria, chave;

-- Políticas RLS
ALTER TABLE public.auditoria_equipamentos_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_equipamentos_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema_2025_12_16_05_00 ENABLE ROW LEVEL SECURITY;

-- Política para auditoria - apenas administradores
CREATE POLICY "Apenas admins veem auditoria" ON public.auditoria_equipamentos_2025_12_16_05_00
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Política para backup - apenas administradores
CREATE POLICY "Apenas admins veem backups" ON public.backup_equipamentos_2025_12_16_05_00
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Política para configurações - apenas administradores podem editar
CREATE POLICY "Todos veem configurações" ON public.configuracoes_sistema_2025_12_16_05_00
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas admins editam configurações" ON public.configuracoes_sistema_2025_12_16_05_00
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Apenas admins atualizam configurações" ON public.configuracoes_sistema_2025_12_16_05_00
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Função para limpeza automática de auditoria antiga
CREATE OR REPLACE FUNCTION limpar_auditoria_antiga()
RETURNS INTEGER AS $$
DECLARE
    count_deleted INTEGER;
    dias_retencao INTEGER;
BEGIN
    -- Obter configuração de retenção
    SELECT (valor->>'dias_retencao')::INTEGER INTO dias_retencao
    FROM public.configuracoes_sistema_2025_12_16_05_00 
    WHERE chave = 'auditoria_retencao_dias';
    
    -- Usar padrão se não configurado
    IF dias_retencao IS NULL THEN
        dias_retencao := 365; -- 1 ano por padrão
    END IF;
    
    -- Deletar registros antigos
    DELETE FROM public.auditoria_equipamentos_2025_12_16_05_00 
    WHERE created_at < NOW() - (dias_retencao || ' days')::INTERVAL;
    
    GET DIAGNOSTICS count_deleted = ROW_COUNT;
    RETURN count_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;