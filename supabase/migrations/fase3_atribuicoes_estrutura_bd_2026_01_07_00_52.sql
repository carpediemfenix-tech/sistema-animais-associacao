-- =====================================================
-- FASE 3: ATRIBUIÇÕES AVANÇADAS - BASE DE DADOS
-- Data: 2026-01-07 00:52 UTC
-- =====================================================

-- 1. Tabela de Atribuições de Itens
CREATE TABLE IF NOT EXISTS public.atribuicoes_itens_2026_01_07_00_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES public.itens_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Tipo de atribuição
    tipo_atribuicao VARCHAR(20) NOT NULL CHECK (tipo_atribuicao IN ('VOLUNTARIO', 'ANIMAL', 'MISSAO')),
    
    -- IDs das entidades (apenas um será preenchido por atribuição)
    voluntario_id VARCHAR(100), -- Referência flexível para voluntários
    animal_id VARCHAR(100),     -- Referência flexível para animais
    missao_id VARCHAR(100),     -- Referência flexível para missões
    
    -- Detalhes da atribuição
    quantidade_atribuida INTEGER NOT NULL CHECK (quantidade_atribuida > 0),
    data_atribuicao TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    data_devolucao_prevista TIMESTAMP WITH TIME ZONE,
    data_devolucao_real TIMESTAMP WITH TIME ZONE,
    
    -- Estado da atribuição
    estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO' CHECK (estado IN ('ATIVO', 'DEVOLVIDO', 'CONSUMIDO', 'PERDIDO', 'DANIFICADO')),
    
    -- Informações adicionais
    motivo TEXT,
    observacoes TEXT,
    condicoes_devolucao TEXT,
    valor_responsabilidade DECIMAL(10,2), -- Valor pelo qual a entidade é responsável
    
    -- Verificação na devolução
    verificado_por VARCHAR(100),
    data_verificacao TIMESTAMP WITH TIME ZONE,
    estado_devolucao VARCHAR(20) CHECK (estado_devolucao IN ('BOM', 'DANIFICADO', 'PERDIDO', 'CONSUMIDO')),
    observacoes_verificacao TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Estados dos Itens (histórico de mudanças de estado)
CREATE TABLE IF NOT EXISTS public.estados_itens_2026_01_07_00_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES public.itens_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    atribuicao_id UUID REFERENCES public.atribuicoes_itens_2026_01_07_00_52(id) ON DELETE SET NULL,
    
    -- Estado do item
    estado_anterior VARCHAR(20),
    estado_novo VARCHAR(20) NOT NULL CHECK (estado_novo IN ('DISPONIVEL', 'ATRIBUIDO', 'EM_USO', 'EM_VERIFICACAO', 'CONSUMIDO', 'DANIFICADO', 'PERDIDO')),
    
    -- Detalhes da mudança
    motivo_mudanca TEXT,
    observacoes TEXT,
    
    -- Auditoria
    data_mudanca TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    alterado_por UUID REFERENCES auth.users(id)
);

-- 3. Tabela de Configurações de Atribuição por Categoria
CREATE TABLE IF NOT EXISTS public.config_atribuicoes_2026_01_07_00_52 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria_id UUID NOT NULL REFERENCES public.categorias_aprovisionamento_2026_01_06(id) ON DELETE CASCADE,
    
    -- Configurações por tipo de atribuição
    permite_voluntarios BOOLEAN DEFAULT true,
    permite_animais BOOLEAN DEFAULT true,
    permite_missoes BOOLEAN DEFAULT true,
    
    -- Limites e regras
    quantidade_maxima_por_voluntario INTEGER,
    quantidade_maxima_por_animal INTEGER,
    quantidade_maxima_por_missao INTEGER,
    
    -- Prazos padrão
    prazo_devolucao_dias INTEGER DEFAULT 30,
    requer_verificacao BOOLEAN DEFAULT true,
    permite_consumo BOOLEAN DEFAULT false,
    
    -- Responsabilidade financeira
    valor_responsabilidade_padrao DECIMAL(10,2),
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para atribuições
CREATE INDEX IF NOT EXISTS idx_atribuicoes_item_id ON public.atribuicoes_itens_2026_01_07_00_52(item_id);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_voluntario_id ON public.atribuicoes_itens_2026_01_07_00_52(voluntario_id) WHERE voluntario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_atribuicoes_animal_id ON public.atribuicoes_itens_2026_01_07_00_52(animal_id) WHERE animal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_atribuicoes_missao_id ON public.atribuicoes_itens_2026_01_07_00_52(missao_id) WHERE missao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_atribuicoes_estado ON public.atribuicoes_itens_2026_01_07_00_52(estado);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_data ON public.atribuicoes_itens_2026_01_07_00_52(data_atribuicao);

-- Índices para estados
CREATE INDEX IF NOT EXISTS idx_estados_item_id ON public.estados_itens_2026_01_07_00_52(item_id);
CREATE INDEX IF NOT EXISTS idx_estados_data ON public.estados_itens_2026_01_07_00_52(data_mudanca);

-- Índices para configurações
CREATE INDEX IF NOT EXISTS idx_config_categoria_id ON public.config_atribuicoes_2026_01_07_00_52(categoria_id);

-- =====================================================
-- TRIGGERS PARA AUDITORIA
-- =====================================================

-- Trigger para updated_at em atribuições
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_atribuicoes_updated_at 
    BEFORE UPDATE ON public.atribuicoes_itens_2026_01_07_00_52 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_atribuicoes_updated_at 
    BEFORE UPDATE ON public.config_atribuicoes_2026_01_07_00_52 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.atribuicoes_itens_2026_01_07_00_52 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_itens_2026_01_07_00_52 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_atribuicoes_2026_01_07_00_52 ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para usuários autenticados
CREATE POLICY "atribuicoes_all_authenticated" ON public.atribuicoes_itens_2026_01_07_00_52
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "estados_all_authenticated" ON public.estados_itens_2026_01_07_00_52
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "config_atribuicoes_all_authenticated" ON public.config_atribuicoes_2026_01_07_00_52
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNÇÃO PARA CRIAR ATRIBUIÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION public.criar_atribuicao_item(
    p_item_id UUID,
    p_tipo_atribuicao VARCHAR(20),
    p_entidade_id VARCHAR(100),
    p_quantidade INTEGER,
    p_data_devolucao_prevista TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_motivo TEXT DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_config RECORD;
    v_atribuicao_id UUID;
    v_quantidade_disponivel INTEGER;
    v_quantidade_atribuida INTEGER;
BEGIN
    -- Verificar se o item existe
    SELECT * INTO v_item FROM public.itens_aprovisionamento_2026_01_06 WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Item não encontrado');
    END IF;

    -- Verificar configurações da categoria
    SELECT * INTO v_config FROM public.config_atribuicoes_2026_01_07_00_52 
    WHERE categoria_id = (SELECT categoria_id FROM public.tipos_aprovisionamento_2026_01_06 WHERE id = v_item.tipo_id);

    -- Verificar se o tipo de atribuição é permitido
    IF v_config.id IS NOT NULL THEN
        IF p_tipo_atribuicao = 'VOLUNTARIO' AND NOT v_config.permite_voluntarios THEN
            RETURN json_build_object('success', false, 'error', 'Atribuição a voluntários não permitida para esta categoria');
        END IF;
        IF p_tipo_atribuicao = 'ANIMAL' AND NOT v_config.permite_animais THEN
            RETURN json_build_object('success', false, 'error', 'Atribuição a animais não permitida para esta categoria');
        END IF;
        IF p_tipo_atribuicao = 'MISSAO' AND NOT v_config.permite_missoes THEN
            RETURN json_build_object('success', false, 'error', 'Atribuição a missões não permitida para esta categoria');
        END IF;
    END IF;

    -- Calcular quantidade disponível (stock atual - atribuições ativas)
    SELECT COALESCE(SUM(quantidade_atribuida), 0) INTO v_quantidade_atribuida
    FROM public.atribuicoes_itens_2026_01_07_00_52
    WHERE item_id = p_item_id AND estado = 'ATIVO';

    v_quantidade_disponivel := v_item.quantidade_atual - v_quantidade_atribuida;

    -- Verificar se há stock suficiente
    IF p_quantidade > v_quantidade_disponivel THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Stock insuficiente para atribuição',
            'disponivel', v_quantidade_disponivel,
            'solicitado', p_quantidade
        );
    END IF;

    -- Criar a atribuição
    INSERT INTO public.atribuicoes_itens_2026_01_07_00_52 (
        item_id,
        tipo_atribuicao,
        voluntario_id,
        animal_id,
        missao_id,
        quantidade_atribuida,
        data_devolucao_prevista,
        motivo,
        observacoes,
        valor_responsabilidade,
        created_by
    ) VALUES (
        p_item_id,
        p_tipo_atribuicao,
        CASE WHEN p_tipo_atribuicao = 'VOLUNTARIO' THEN p_entidade_id ELSE NULL END,
        CASE WHEN p_tipo_atribuicao = 'ANIMAL' THEN p_entidade_id ELSE NULL END,
        CASE WHEN p_tipo_atribuicao = 'MISSAO' THEN p_entidade_id ELSE NULL END,
        p_quantidade,
        COALESCE(p_data_devolucao_prevista, NOW() + INTERVAL '30 days'),
        p_motivo,
        p_observacoes,
        COALESCE(v_config.valor_responsabilidade_padrao, v_item.preco_unitario * p_quantidade),
        auth.uid()
    ) RETURNING id INTO v_atribuicao_id;

    -- Registrar mudança de estado
    INSERT INTO public.estados_itens_2026_01_07_00_52 (
        item_id,
        atribuicao_id,
        estado_anterior,
        estado_novo,
        motivo_mudanca,
        alterado_por
    ) VALUES (
        p_item_id,
        v_atribuicao_id,
        'DISPONIVEL',
        'ATRIBUIDO',
        'Atribuição criada: ' || p_tipo_atribuicao || ' - ' || p_entidade_id,
        auth.uid()
    );

    RETURN json_build_object(
        'success', true,
        'atribuicao_id', v_atribuicao_id,
        'quantidade_disponivel_restante', v_quantidade_disponivel - p_quantidade
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;