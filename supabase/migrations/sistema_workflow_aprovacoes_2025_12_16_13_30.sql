-- ========================================
-- SISTEMA DE WORKFLOW E APROVAÇÕES
-- ========================================

-- Tabela para definir tipos de workflow
CREATE TABLE IF NOT EXISTS public.tipos_workflow_2025_12_16_13_30 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) DEFAULT 'geral',
    
    -- Configuração
    etapas JSONB NOT NULL, -- Array de etapas com aprovadores
    ativo BOOLEAN DEFAULT true,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para instâncias de workflow
CREATE TABLE IF NOT EXISTS public.workflows_2025_12_16_13_30 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referência
    tipo_workflow_id UUID REFERENCES public.tipos_workflow_2025_12_16_13_30(id),
    
    -- Identificação
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    
    -- Dados do processo
    dados_processo JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'aprovado', 'rejeitado', 'cancelado')),
    etapa_atual INTEGER DEFAULT 1,
    
    -- Pessoas
    solicitante_id UUID,
    aprovador_atual_id UUID,
    
    -- Timing
    prazo_aprovacao TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para histórico de aprovações
CREATE TABLE IF NOT EXISTS public.aprovacoes_workflow_2025_12_16_13_30 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    workflow_id UUID REFERENCES public.workflows_2025_12_16_13_30(id) ON DELETE CASCADE,
    
    -- Aprovação
    etapa INTEGER NOT NULL,
    aprovador_id UUID,
    acao VARCHAR(20) NOT NULL CHECK (acao IN ('aprovado', 'rejeitado', 'solicitado_alteracao')),
    comentario TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflows_2025_12_16_13_30(status, created_at);
CREATE INDEX IF NOT EXISTS idx_workflows_aprovador ON public.workflows_2025_12_16_13_30(aprovador_atual_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_workflow ON public.aprovacoes_workflow_2025_12_16_13_30(workflow_id, etapa);

-- Função para criar novo workflow
CREATE OR REPLACE FUNCTION criar_workflow(
    p_tipo_workflow_id UUID,
    p_titulo VARCHAR,
    p_descricao TEXT,
    p_dados_processo JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_workflow_id UUID;
    v_tipo_workflow RECORD;
    v_primeira_etapa JSONB;
    v_aprovador_id UUID;
BEGIN
    -- Buscar tipo de workflow
    SELECT * INTO v_tipo_workflow 
    FROM public.tipos_workflow_2025_12_16_13_30 
    WHERE id = p_tipo_workflow_id AND ativo = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tipo de workflow não encontrado ou inativo';
    END IF;
    
    -- Obter primeira etapa
    v_primeira_etapa := (v_tipo_workflow.etapas->0);
    v_aprovador_id := (v_primeira_etapa->>'aprovador_id')::UUID;
    
    -- Criar workflow
    INSERT INTO public.workflows_2025_12_16_13_30 (
        tipo_workflow_id, titulo, descricao, dados_processo, 
        solicitante_id, aprovador_atual_id, status
    ) VALUES (
        p_tipo_workflow_id, p_titulo, p_descricao, p_dados_processo,
        auth.uid(), v_aprovador_id, 'em_andamento'
    ) RETURNING id INTO v_workflow_id;
    
    -- Registrar log inicial
    PERFORM registrar_log(
        'workflow',
        'criado',
        'Workflow criado: ' || p_titulo,
        'info',
        auth.uid(),
        'workflows_2025_12_16_13_30',
        v_workflow_id,
        jsonb_build_object('tipo_workflow_id', p_tipo_workflow_id)
    );
    
    RETURN v_workflow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar aprovação
CREATE OR REPLACE FUNCTION processar_aprovacao_workflow(
    p_workflow_id UUID,
    p_acao VARCHAR,
    p_comentario TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_workflow RECORD;
    v_tipo_workflow RECORD;
    v_etapa_atual JSONB;
    v_proxima_etapa JSONB;
    v_novo_status VARCHAR;
    v_novo_aprovador UUID;
    v_nova_etapa INTEGER;
BEGIN
    -- Buscar workflow
    SELECT * INTO v_workflow 
    FROM public.workflows_2025_12_16_13_30 
    WHERE id = p_workflow_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Workflow não encontrado';
    END IF;
    
    -- Verificar se usuário pode aprovar
    IF v_workflow.aprovador_atual_id != auth.uid() THEN
        RAISE EXCEPTION 'Usuário não autorizado para esta aprovação';
    END IF;
    
    -- Buscar tipo de workflow
    SELECT * INTO v_tipo_workflow 
    FROM public.tipos_workflow_2025_12_16_13_30 
    WHERE id = v_workflow.tipo_workflow_id;
    
    -- Registrar aprovação
    INSERT INTO public.aprovacoes_workflow_2025_12_16_13_30 (
        workflow_id, etapa, aprovador_id, acao, comentario
    ) VALUES (
        p_workflow_id, v_workflow.etapa_atual, auth.uid(), p_acao, p_comentario
    );
    
    -- Processar ação
    IF p_acao = 'rejeitado' THEN
        v_novo_status := 'rejeitado';
        v_novo_aprovador := NULL;
        v_nova_etapa := v_workflow.etapa_atual;
    ELSIF p_acao = 'aprovado' THEN
        -- Verificar se há próxima etapa
        v_proxima_etapa := (v_tipo_workflow.etapas->(v_workflow.etapa_atual));
        
        IF v_proxima_etapa IS NOT NULL THEN
            -- Há próxima etapa
            v_novo_status := 'em_andamento';
            v_novo_aprovador := (v_proxima_etapa->>'aprovador_id')::UUID;
            v_nova_etapa := v_workflow.etapa_atual + 1;
        ELSE
            -- Última etapa - workflow aprovado
            v_novo_status := 'aprovado';
            v_novo_aprovador := NULL;
            v_nova_etapa := v_workflow.etapa_atual;
        END IF;
    END IF;
    
    -- Atualizar workflow
    UPDATE public.workflows_2025_12_16_13_30 
    SET 
        status = v_novo_status,
        etapa_atual = v_nova_etapa,
        aprovador_atual_id = v_novo_aprovador,
        updated_at = NOW()
    WHERE id = p_workflow_id;
    
    -- Registrar log
    PERFORM registrar_log(
        'workflow',
        'aprovacao_processada',
        'Workflow ' || p_acao || ': ' || v_workflow.titulo,
        'info',
        auth.uid(),
        'workflows_2025_12_16_13_30',
        p_workflow_id,
        jsonb_build_object('acao', p_acao, 'etapa', v_workflow.etapa_atual)
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter workflows pendentes para usuário
CREATE OR REPLACE FUNCTION obter_workflows_pendentes_usuario()
RETURNS TABLE (
    id UUID,
    titulo VARCHAR,
    descricao TEXT,
    categoria VARCHAR,
    etapa_atual INTEGER,
    solicitante_nome TEXT,
    prazo_aprovacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.titulo,
        w.descricao,
        tw.categoria,
        w.etapa_atual,
        COALESCE(v.display_name, v.nome, 'Usuário não encontrado') as solicitante_nome,
        w.prazo_aprovacao,
        w.created_at
    FROM public.workflows_2025_12_16_13_30 w
    JOIN public.tipos_workflow_2025_12_16_13_30 tw ON w.tipo_workflow_id = tw.id
    LEFT JOIN public.voluntarios v ON w.solicitante_id = v.id
    WHERE w.aprovador_atual_id = auth.uid()
    AND w.status = 'em_andamento'
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir tipos de workflow de exemplo
INSERT INTO public.tipos_workflow_2025_12_16_13_30 (nome, descricao, categoria, etapas) VALUES 
(
    'Aprovação de Adoção',
    'Processo de aprovação para adoção de animais',
    'animais',
    '[
        {"nome": "Análise Inicial", "aprovador_id": null, "descricao": "Verificação de documentos"},
        {"nome": "Aprovação Final", "aprovador_id": null, "descricao": "Aprovação final da adoção"}
    ]'::jsonb
),
(
    'Solicitação de Equipamento',
    'Processo para solicitação de novos equipamentos',
    'equipamentos',
    '[
        {"nome": "Aprovação Coordenação", "aprovador_id": null, "descricao": "Aprovação da coordenação"},
        {"nome": "Aprovação Financeira", "aprovador_id": null, "descricao": "Aprovação do orçamento"}
    ]'::jsonb
),
(
    'Cadastro de Voluntário',
    'Processo de aprovação para novos voluntários',
    'voluntarios',
    '[
        {"nome": "Verificação de Dados", "aprovador_id": null, "descricao": "Verificação de informações"},
        {"nome": "Aprovação Final", "aprovador_id": null, "descricao": "Aprovação final do cadastro"}
    ]'::jsonb
);

-- RLS para workflows
ALTER TABLE public.tipos_workflow_2025_12_16_13_30 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows_2025_12_16_13_30 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aprovacoes_workflow_2025_12_16_13_30 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver tipos de workflow ativos" ON public.tipos_workflow_2025_12_16_13_30
    FOR SELECT USING (ativo = true);

CREATE POLICY "Usuários podem ver workflows relacionados" ON public.workflows_2025_12_16_13_30
    FOR SELECT USING (solicitante_id = auth.uid() OR aprovador_atual_id = auth.uid());

CREATE POLICY "Usuários podem criar workflows" ON public.workflows_2025_12_16_13_30
    FOR INSERT WITH CHECK (solicitante_id = auth.uid());

CREATE POLICY "Usuários podem ver aprovações relacionadas" ON public.aprovacoes_workflow_2025_12_16_13_30
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workflows_2025_12_16_13_30 w 
            WHERE w.id = workflow_id 
            AND (w.solicitante_id = auth.uid() OR w.aprovador_atual_id = auth.uid())
        )
    );

SELECT 'Sistema de workflow e aprovações implementado com sucesso!' as status;