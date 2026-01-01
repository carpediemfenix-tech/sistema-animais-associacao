-- =====================================================
-- FASE 2 - MÓDULO DE DENÚNCIAS AVANÇADO
-- Estruturas para timeline, conclusão e estatísticas
-- =====================================================

-- 1. TABELA DE TIMELINE DE DENÚNCIAS
-- Registra todas as ações e mudanças na denúncia
CREATE TABLE IF NOT EXISTS public.timeline_denuncias_2025_12_31_23_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    denuncia_id UUID NOT NULL,
    tipo_acao VARCHAR(50) NOT NULL, -- 'criacao', 'mudanca_status', 'edicao', 'conclusao', 'arquivamento', 'comentario'
    acao_anterior TEXT, -- Estado anterior (para mudanças)
    acao_nova TEXT, -- Estado novo
    descricao TEXT NOT NULL, -- Descrição da ação
    usuario_id UUID, -- Quem fez a ação
    usuario_nome VARCHAR(255), -- Nome do usuário (cache)
    dados_extras JSONB, -- Dados adicionais da ação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_timeline_denuncias_denuncia_id ON public.timeline_denuncias_2025_12_31_23_00(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_timeline_denuncias_created_at ON public.timeline_denuncias_2025_12_31_23_00(created_at);
CREATE INDEX IF NOT EXISTS idx_timeline_denuncias_tipo_acao ON public.timeline_denuncias_2025_12_31_23_00(tipo_acao);

-- 2. TABELA DE RELATÓRIOS DE CONCLUSÃO
-- Armazena relatórios detalhados quando uma denúncia é concluída
CREATE TABLE IF NOT EXISTS public.relatorios_conclusao_2025_12_31_23_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    denuncia_id UUID NOT NULL UNIQUE, -- Uma denúncia só pode ter um relatório de conclusão
    resultado_operacao VARCHAR(100) NOT NULL, -- 'sucesso_total', 'sucesso_parcial', 'sem_sucesso', 'falso_alarme'
    animais_resgatados INTEGER DEFAULT 0,
    animais_tratados INTEGER DEFAULT 0,
    animais_adotados INTEGER DEFAULT 0,
    animais_obito INTEGER DEFAULT 0,
    custo_total DECIMAL(10,2) DEFAULT 0,
    custo_veterinario DECIMAL(10,2) DEFAULT 0,
    custo_transporte DECIMAL(10,2) DEFAULT 0,
    custo_alimentacao DECIMAL(10,2) DEFAULT 0,
    tempo_operacao_horas INTEGER DEFAULT 0,
    voluntarios_envolvidos INTEGER DEFAULT 0,
    autoridades_acionadas TEXT[], -- Array de autoridades contactadas
    evidencias_coletadas TEXT[], -- Array de evidências
    acoes_tomadas TEXT NOT NULL, -- Descrição detalhada das ações
    resultados_obtidos TEXT NOT NULL, -- Resultados alcançados
    licoes_aprendidas TEXT, -- Lições para futuras operações
    recomendacoes TEXT, -- Recomendações
    responsavel_relatorio_id UUID, -- Quem criou o relatório
    responsavel_relatorio_nome VARCHAR(255),
    assinatura_digital TEXT, -- Hash da assinatura
    data_conclusao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_relatorios_conclusao_denuncia_id ON public.relatorios_conclusao_2025_12_31_23_00(denuncia_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_conclusao_data ON public.relatorios_conclusao_2025_12_31_23_00(data_conclusao);
CREATE INDEX IF NOT EXISTS idx_relatorios_conclusao_resultado ON public.relatorios_conclusao_2025_12_31_23_00(resultado_operacao);

-- 3. TABELA DE MÉTRICAS E ESTATÍSTICAS
-- Armazena métricas calculadas para dashboards
CREATE TABLE IF NOT EXISTS public.metricas_denuncias_2025_12_31_23_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    periodo_tipo VARCHAR(20) NOT NULL, -- 'diario', 'semanal', 'mensal', 'anual'
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    total_denuncias INTEGER DEFAULT 0,
    denuncias_novas INTEGER DEFAULT 0,
    denuncias_em_andamento INTEGER DEFAULT 0,
    denuncias_concluidas INTEGER DEFAULT 0,
    denuncias_arquivadas INTEGER DEFAULT 0,
    animais_resgatados INTEGER DEFAULT 0,
    animais_tratados INTEGER DEFAULT 0,
    animais_adotados INTEGER DEFAULT 0,
    custo_total DECIMAL(12,2) DEFAULT 0,
    tempo_medio_resolucao DECIMAL(8,2) DEFAULT 0, -- Em horas
    taxa_sucesso DECIMAL(5,2) DEFAULT 0, -- Percentual
    voluntarios_ativos INTEGER DEFAULT 0,
    dados_extras JSONB, -- Dados adicionais
    calculado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices únicos para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_metricas_denuncias_periodo 
ON public.metricas_denuncias_2025_12_31_23_00(periodo_tipo, periodo_inicio, periodo_fim);

-- 4. ADICIONAR CAMPOS AVANÇADOS À TABELA DE DENÚNCIAS
-- Campos para conclusão e arquivamento avançado
ALTER TABLE public.denuncias_2025_12_29_23_00 
ADD COLUMN IF NOT EXISTS data_inicio_operacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_fim_operacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tempo_total_horas DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_estimado DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_real DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS resultado_final VARCHAR(100),
ADD COLUMN IF NOT EXISTS tem_relatorio_conclusao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS motivo_arquivamento TEXT,
ADD COLUMN IF NOT EXISTS pode_ser_restaurada BOOLEAN DEFAULT TRUE;

-- 5. FUNÇÃO PARA CRIAR ENTRADA NA TIMELINE
CREATE OR REPLACE FUNCTION public.criar_timeline_denuncia(
    p_denuncia_id UUID,
    p_tipo_acao VARCHAR(50),
    p_descricao TEXT,
    p_acao_anterior TEXT DEFAULT NULL,
    p_acao_nova TEXT DEFAULT NULL,
    p_usuario_id UUID DEFAULT NULL,
    p_usuario_nome VARCHAR(255) DEFAULT NULL,
    p_dados_extras JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    timeline_id UUID;
BEGIN
    INSERT INTO public.timeline_denuncias_2025_12_31_23_00 (
        denuncia_id,
        tipo_acao,
        descricao,
        acao_anterior,
        acao_nova,
        usuario_id,
        usuario_nome,
        dados_extras
    ) VALUES (
        p_denuncia_id,
        p_tipo_acao,
        p_descricao,
        p_acao_anterior,
        p_acao_nova,
        p_usuario_id,
        p_usuario_nome,
        p_dados_extras
    ) RETURNING id INTO timeline_id;
    
    RETURN timeline_id;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA TIMELINE AUTOMÁTICA
-- Cria entradas na timeline quando há mudanças na denúncia
CREATE OR REPLACE FUNCTION public.trigger_timeline_denuncias()
RETURNS TRIGGER AS $$
BEGIN
    -- Mudança de status
    IF OLD.status_denuncia IS DISTINCT FROM NEW.status_denuncia THEN
        PERFORM public.criar_timeline_denuncia(
            NEW.id,
            'mudanca_status',
            'Status alterado de "' || COALESCE(OLD.status_denuncia, 'indefinido') || '" para "' || NEW.status_denuncia || '"',
            OLD.status_denuncia,
            NEW.status_denuncia,
            NEW.updated_by::UUID,
            'Sistema'
        );
    END IF;
    
    -- Mudança de prioridade
    IF OLD.prioridade IS DISTINCT FROM NEW.prioridade THEN
        PERFORM public.criar_timeline_denuncia(
            NEW.id,
            'mudanca_prioridade',
            'Prioridade alterada de "' || COALESCE(OLD.prioridade, 'indefinida') || '" para "' || NEW.prioridade || '"',
            OLD.prioridade,
            NEW.prioridade,
            NEW.updated_by::UUID,
            'Sistema'
        );
    END IF;
    
    -- Arquivamento
    IF OLD.arquivada IS DISTINCT FROM NEW.arquivada AND NEW.arquivada = TRUE THEN
        PERFORM public.criar_timeline_denuncia(
            NEW.id,
            'arquivamento',
            'Denúncia arquivada. Motivo: ' || COALESCE(NEW.motivo_arquivamento, 'Não especificado'),
            'ativa',
            'arquivada',
            NEW.arquivada_por::UUID,
            'Sistema'
        );
    END IF;
    
    -- Restauração
    IF OLD.arquivada IS DISTINCT FROM NEW.arquivada AND NEW.arquivada = FALSE THEN
        PERFORM public.criar_timeline_denuncia(
            NEW.id,
            'restauracao',
            'Denúncia restaurada do arquivo',
            'arquivada',
            'ativa',
            NEW.updated_by::UUID,
            'Sistema'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_timeline_denuncias ON public.denuncias_2025_12_29_23_00;
CREATE TRIGGER trigger_timeline_denuncias
    AFTER UPDATE ON public.denuncias_2025_12_29_23_00
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_timeline_denuncias();

-- 7. FUNÇÃO PARA CALCULAR MÉTRICAS
CREATE OR REPLACE FUNCTION public.calcular_metricas_periodo(
    p_periodo_tipo VARCHAR(20),
    p_data_inicio DATE,
    p_data_fim DATE
)
RETURNS UUID AS $$
DECLARE
    metrica_id UUID;
    v_total_denuncias INTEGER;
    v_denuncias_novas INTEGER;
    v_denuncias_em_andamento INTEGER;
    v_denuncias_concluidas INTEGER;
    v_denuncias_arquivadas INTEGER;
    v_animais_resgatados INTEGER;
    v_custo_total DECIMAL(12,2);
    v_tempo_medio DECIMAL(8,2);
    v_taxa_sucesso DECIMAL(5,2);
BEGIN
    -- Calcular estatísticas
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status_denuncia = 'nova'),
        COUNT(*) FILTER (WHERE status_denuncia = 'em_andamento'),
        COUNT(*) FILTER (WHERE status_denuncia = 'concluida'),
        COUNT(*) FILTER (WHERE arquivada = TRUE),
        COALESCE(SUM(quantidade_animais), 0),
        COALESCE(SUM(custo_real), 0),
        COALESCE(AVG(tempo_total_horas), 0),
        CASE 
            WHEN COUNT(*) FILTER (WHERE status_denuncia = 'concluida') > 0 
            THEN (COUNT(*) FILTER (WHERE status_denuncia = 'concluida' AND resultado_final IN ('sucesso_total', 'sucesso_parcial'))::DECIMAL / COUNT(*) FILTER (WHERE status_denuncia = 'concluida')) * 100
            ELSE 0 
        END
    INTO 
        v_total_denuncias,
        v_denuncias_novas,
        v_denuncias_em_andamento,
        v_denuncias_concluidas,
        v_denuncias_arquivadas,
        v_animais_resgatados,
        v_custo_total,
        v_tempo_medio,
        v_taxa_sucesso
    FROM public.denuncias_2025_12_29_23_00
    WHERE data_denuncia::DATE BETWEEN p_data_inicio AND p_data_fim;
    
    -- Inserir ou atualizar métricas
    INSERT INTO public.metricas_denuncias_2025_12_31_23_00 (
        periodo_tipo,
        periodo_inicio,
        periodo_fim,
        total_denuncias,
        denuncias_novas,
        denuncias_em_andamento,
        denuncias_concluidas,
        denuncias_arquivadas,
        animais_resgatados,
        custo_total,
        tempo_medio_resolucao,
        taxa_sucesso
    ) VALUES (
        p_periodo_tipo,
        p_data_inicio,
        p_data_fim,
        v_total_denuncias,
        v_denuncias_novas,
        v_denuncias_em_andamento,
        v_denuncias_concluidas,
        v_denuncias_arquivadas,
        v_animais_resgatados,
        v_custo_total,
        v_tempo_medio,
        v_taxa_sucesso
    ) 
    ON CONFLICT (periodo_tipo, periodo_inicio, periodo_fim) 
    DO UPDATE SET
        total_denuncias = EXCLUDED.total_denuncias,
        denuncias_novas = EXCLUDED.denuncias_novas,
        denuncias_em_andamento = EXCLUDED.denuncias_em_andamento,
        denuncias_concluidas = EXCLUDED.denuncias_concluidas,
        denuncias_arquivadas = EXCLUDED.denuncias_arquivadas,
        animais_resgatados = EXCLUDED.animais_resgatados,
        custo_total = EXCLUDED.custo_total,
        tempo_medio_resolucao = EXCLUDED.tempo_medio_resolucao,
        taxa_sucesso = EXCLUDED.taxa_sucesso,
        calculado_em = NOW()
    RETURNING id INTO metrica_id;
    
    RETURN metrica_id;
END;
$$ LANGUAGE plpgsql;

-- 8. INSERIR DADOS DE EXEMPLO PARA TIMELINE
-- Timeline para denúncias existentes
DO $$
DECLARE
    denuncia_record RECORD;
BEGIN
    FOR denuncia_record IN 
        SELECT id, codigo, created_at, status_denuncia 
        FROM public.denuncias_2025_12_29_23_00 
        LIMIT 5
    LOOP
        -- Entrada de criação
        PERFORM public.criar_timeline_denuncia(
            denuncia_record.id,
            'criacao',
            'Denúncia ' || denuncia_record.codigo || ' criada no sistema',
            NULL,
            'nova',
            NULL,
            'Sistema Wizard',
            '{"origem": "wizard_denuncia"}'::jsonb
        );
        
        -- Se não for nova, adicionar mudança de status
        IF denuncia_record.status_denuncia != 'nova' THEN
            PERFORM public.criar_timeline_denuncia(
                denuncia_record.id,
                'mudanca_status',
                'Status alterado para "' || denuncia_record.status_denuncia || '"',
                'nova',
                denuncia_record.status_denuncia,
                NULL,
                'Sistema'
            );
        END IF;
    END LOOP;
END $$;

-- 9. CALCULAR MÉTRICAS INICIAIS
-- Métricas do mês atual
SELECT public.calcular_metricas_periodo(
    'mensal',
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
);

-- Métricas do ano atual
SELECT public.calcular_metricas_periodo(
    'anual',
    DATE_TRUNC('year', CURRENT_DATE)::DATE,
    (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE
);

-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON TABLE public.timeline_denuncias_2025_12_31_23_00 IS 'Timeline completa de ações em denúncias para auditoria e histórico';
COMMENT ON TABLE public.relatorios_conclusao_2025_12_31_23_00 IS 'Relatórios detalhados de conclusão de operações de resgate';
COMMENT ON TABLE public.metricas_denuncias_2025_12_31_23_00 IS 'Métricas e estatísticas calculadas para dashboards e relatórios';

-- =====================================================
-- FIM DA IMPLEMENTAÇÃO FASE 2
-- Sistema avançado de denúncias implementado com sucesso!
-- =====================================================