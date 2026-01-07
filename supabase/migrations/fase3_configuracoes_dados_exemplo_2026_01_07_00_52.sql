-- =====================================================
-- FASE 3: CONFIGURAÇÕES PADRÃO E DADOS DE EXEMPLO
-- Data: 2026-01-07 00:52 UTC
-- =====================================================

-- 1. Inserir configurações padrão por categoria
INSERT INTO public.config_atribuicoes_2026_01_07_00_52 (
    categoria_id,
    permite_voluntarios,
    permite_animais,
    permite_missoes,
    quantidade_maxima_por_voluntario,
    quantidade_maxima_por_animal,
    quantidade_maxima_por_missao,
    prazo_devolucao_dias,
    requer_verificacao,
    permite_consumo,
    valor_responsabilidade_padrao
)
SELECT 
    c.id as categoria_id,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN true
        WHEN c.nome = 'Consumíveis Alimentares' THEN false
        WHEN c.nome = 'Medicação' THEN false
        WHEN c.nome = 'Ferramentas de Terreno' THEN true
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN true
        WHEN c.nome = 'Consumíveis de Escritório' THEN false
        WHEN c.nome = 'Consumíveis de Limpeza' THEN false
        WHEN c.nome = 'Merchandising' THEN true
        ELSE true
    END as permite_voluntarios,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN false
        WHEN c.nome = 'Consumíveis Alimentares' THEN true
        WHEN c.nome = 'Medicação' THEN true
        WHEN c.nome = 'Ferramentas de Terreno' THEN false
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN false
        WHEN c.nome = 'Consumíveis de Escritório' THEN false
        WHEN c.nome = 'Consumíveis de Limpeza' THEN true
        WHEN c.nome = 'Merchandising' THEN false
        ELSE false
    END as permite_animais,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN true
        WHEN c.nome = 'Consumíveis Alimentares' THEN true
        WHEN c.nome = 'Medicação' THEN true
        WHEN c.nome = 'Ferramentas de Terreno' THEN true
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN true
        WHEN c.nome = 'Consumíveis de Escritório' THEN true
        WHEN c.nome = 'Consumíveis de Limpeza' THEN true
        WHEN c.nome = 'Merchandising' THEN true
        ELSE true
    END as permite_missoes,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN 5
        WHEN c.nome = 'Ferramentas de Terreno' THEN 3
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN 2
        WHEN c.nome = 'Merchandising' THEN 10
        ELSE 1
    END as quantidade_maxima_por_voluntario,
    CASE 
        WHEN c.nome = 'Consumíveis Alimentares' THEN 50
        WHEN c.nome = 'Medicação' THEN 10
        WHEN c.nome = 'Consumíveis de Limpeza' THEN 5
        ELSE 1
    END as quantidade_maxima_por_animal,
    CASE 
        WHEN c.nome = 'Consumíveis Alimentares' THEN 100
        WHEN c.nome = 'Medicação' THEN 50
        WHEN c.nome = 'Ferramentas de Terreno' THEN 10
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN 5
        WHEN c.nome = 'Consumíveis de Escritório' THEN 20
        WHEN c.nome = 'Consumíveis de Limpeza' THEN 15
        ELSE 5
    END as quantidade_maxima_por_missao,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN 365
        WHEN c.nome = 'Consumíveis Alimentares' THEN 7
        WHEN c.nome = 'Medicação' THEN 30
        WHEN c.nome = 'Ferramentas de Terreno' THEN 90
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN 180
        WHEN c.nome = 'Consumíveis de Escritório' THEN 30
        WHEN c.nome = 'Consumíveis de Limpeza' THEN 14
        WHEN c.nome = 'Merchandising' THEN 0
        ELSE 30
    END as prazo_devolucao_dias,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN true
        WHEN c.nome = 'Ferramentas de Terreno' THEN true
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN true
        ELSE false
    END as requer_verificacao,
    CASE 
        WHEN c.nome = 'Consumíveis Alimentares' THEN true
        WHEN c.nome = 'Medicação' THEN true
        WHEN c.nome = 'Consumíveis de Escritório' THEN true
        WHEN c.nome = 'Consumíveis de Limpeza' THEN true
        ELSE false
    END as permite_consumo,
    CASE 
        WHEN c.nome = 'Fardamento e EPI' THEN 50.00
        WHEN c.nome = 'Ferramentas de Terreno' THEN 100.00
        WHEN c.nome = 'Equipamentos Eletrônicos' THEN 500.00
        WHEN c.nome = 'Merchandising' THEN 15.00
        ELSE 25.00
    END as valor_responsabilidade_padrao
FROM public.categorias_aprovisionamento_2026_01_06 c
WHERE c.ativo = true
ON CONFLICT DO NOTHING;

-- 2. Inserir algumas atribuições de exemplo
-- Primeiro, vamos buscar alguns IDs de itens existentes
DO $$
DECLARE
    v_item_racao UUID;
    v_item_blusao UUID;
    v_item_medicacao UUID;
    v_voluntario_id VARCHAR(100) := 'e1a980f8-09ed-434e-b838-6a86fb2d24a6'; -- ID do voluntário Jorge António
    v_animal_id VARCHAR(100) := '79c20321-4e40-41ac-8926-62f36a92af78'; -- ID de um animal
    v_missao_id VARCHAR(100) := '8c9252a3-fe8e-48a8-a8c3-6ff20b4977ed'; -- ID de uma missão
BEGIN
    -- Buscar IDs de itens existentes
    SELECT id INTO v_item_racao FROM public.itens_aprovisionamento_2026_01_06 
    WHERE nome ILIKE '%ração%' LIMIT 1;
    
    SELECT id INTO v_item_blusao FROM public.itens_aprovisionamento_2026_01_06 
    WHERE nome ILIKE '%blusão%' LIMIT 1;
    
    SELECT id INTO v_item_medicacao FROM public.itens_aprovisionamento_2026_01_06 
    WHERE nome ILIKE '%antibiótico%' OR nome ILIKE '%medicação%' LIMIT 1;

    -- Atribuição 1: Blusão para voluntário
    IF v_item_blusao IS NOT NULL THEN
        INSERT INTO public.atribuicoes_itens_2026_01_07_00_52 (
            item_id,
            tipo_atribuicao,
            voluntario_id,
            quantidade_atribuida,
            data_devolucao_prevista,
            motivo,
            observacoes,
            valor_responsabilidade
        ) VALUES (
            v_item_blusao,
            'VOLUNTARIO',
            v_voluntario_id,
            1,
            NOW() + INTERVAL '365 days',
            'Atribuição de fardamento para voluntário ativo',
            'Blusão tamanho XXL atribuído para atividades de resgate',
            25.00
        );
    END IF;

    -- Atribuição 2: Ração para animal
    IF v_item_racao IS NOT NULL THEN
        INSERT INTO public.atribuicoes_itens_2026_01_07_00_52 (
            item_id,
            tipo_atribuicao,
            animal_id,
            quantidade_atribuida,
            data_devolucao_prevista,
            motivo,
            observacoes,
            estado
        ) VALUES (
            v_item_racao,
            'ANIMAL',
            v_animal_id,
            5,
            NOW() + INTERVAL '7 days',
            'Alimentação semanal para cão adulto',
            'Ração específica para cão de grande porte',
            'CONSUMIDO'
        );
    END IF;

    -- Atribuição 3: Medicação para missão
    IF v_item_medicacao IS NOT NULL THEN
        INSERT INTO public.atribuicoes_itens_2026_01_07_00_52 (
            item_id,
            tipo_atribuicao,
            missao_id,
            quantidade_atribuida,
            data_devolucao_prevista,
            motivo,
            observacoes,
            valor_responsabilidade
        ) VALUES (
            v_item_medicacao,
            'MISSAO',
            v_missao_id,
            3,
            NOW() + INTERVAL '30 days',
            'Kit de primeiros socorros para missão de resgate',
            'Antibióticos para tratamento de emergência',
            75.00
        );
    END IF;

    -- Registrar estados correspondentes
    IF v_item_blusao IS NOT NULL THEN
        INSERT INTO public.estados_itens_2026_01_07_00_52 (
            item_id,
            estado_anterior,
            estado_novo,
            motivo_mudanca
        ) VALUES (
            v_item_blusao,
            'DISPONIVEL',
            'ATRIBUIDO',
            'Atribuído ao voluntário Jorge António'
        );
    END IF;

    IF v_item_racao IS NOT NULL THEN
        INSERT INTO public.estados_itens_2026_01_07_00_52 (
            item_id,
            estado_anterior,
            estado_novo,
            motivo_mudanca
        ) VALUES (
            v_item_racao,
            'DISPONIVEL',
            'CONSUMIDO',
            'Consumido pelo animal durante alimentação'
        );
    END IF;

    IF v_item_medicacao IS NOT NULL THEN
        INSERT INTO public.estados_itens_2026_01_07_00_52 (
            item_id,
            estado_anterior,
            estado_novo,
            motivo_mudanca
        ) VALUES (
            v_item_medicacao,
            'DISPONIVEL',
            'ATRIBUIDO',
            'Atribuído à missão de resgate'
        );
    END IF;
END $$;

-- 3. Função para processar devolução
CREATE OR REPLACE FUNCTION public.processar_devolucao_item(
    p_atribuicao_id UUID,
    p_quantidade_devolvida INTEGER,
    p_estado_devolucao VARCHAR(20),
    p_observacoes_verificacao TEXT DEFAULT NULL,
    p_verificado_por VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_atribuicao RECORD;
    v_item RECORD;
BEGIN
    -- Buscar a atribuição
    SELECT * INTO v_atribuicao FROM public.atribuicoes_itens_2026_01_07_00_52 
    WHERE id = p_atribuicao_id AND estado = 'ATIVO';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Atribuição não encontrada ou já processada');
    END IF;

    -- Buscar o item
    SELECT * INTO v_item FROM public.itens_aprovisionamento_2026_01_06 WHERE id = v_atribuicao.item_id;

    -- Validar quantidade
    IF p_quantidade_devolvida > v_atribuicao.quantidade_atribuida THEN
        RETURN json_build_object('success', false, 'error', 'Quantidade devolvida maior que a atribuída');
    END IF;

    -- Atualizar a atribuição
    UPDATE public.atribuicoes_itens_2026_01_07_00_52 SET
        data_devolucao_real = NOW(),
        estado = CASE 
            WHEN p_estado_devolucao = 'CONSUMIDO' THEN 'CONSUMIDO'
            WHEN p_estado_devolucao = 'PERDIDO' THEN 'PERDIDO'
            WHEN p_estado_devolucao = 'DANIFICADO' THEN 'DANIFICADO'
            ELSE 'DEVOLVIDO'
        END,
        estado_devolucao = p_estado_devolucao,
        observacoes_verificacao = p_observacoes_verificacao,
        verificado_por = COALESCE(p_verificado_por, auth.uid()::text),
        data_verificacao = NOW(),
        updated_at = NOW()
    WHERE id = p_atribuicao_id;

    -- Registrar mudança de estado
    INSERT INTO public.estados_itens_2026_01_07_00_52 (
        item_id,
        atribuicao_id,
        estado_anterior,
        estado_novo,
        motivo_mudanca,
        observacoes,
        alterado_por
    ) VALUES (
        v_atribuicao.item_id,
        p_atribuicao_id,
        'ATRIBUIDO',
        CASE 
            WHEN p_estado_devolucao = 'CONSUMIDO' THEN 'CONSUMIDO'
            WHEN p_estado_devolucao = 'PERDIDO' THEN 'PERDIDO'
            WHEN p_estado_devolucao = 'DANIFICADO' THEN 'DANIFICADO'
            ELSE 'DISPONIVEL'
        END,
        'Devolução processada: ' || p_estado_devolucao,
        p_observacoes_verificacao,
        auth.uid()
    );

    -- Se foi devolvido em bom estado, adicionar de volta ao stock
    IF p_estado_devolucao = 'BOM' THEN
        UPDATE public.itens_aprovisionamento_2026_01_06 SET
            quantidade_atual = quantidade_atual + p_quantidade_devolvida,
            updated_at = NOW()
        WHERE id = v_atribuicao.item_id;
    END IF;

    RETURN json_build_object(
        'success', true,
        'estado_final', CASE 
            WHEN p_estado_devolucao = 'CONSUMIDO' THEN 'CONSUMIDO'
            WHEN p_estado_devolucao = 'PERDIDO' THEN 'PERDIDO'
            WHEN p_estado_devolucao = 'DANIFICADO' THEN 'DANIFICADO'
            ELSE 'DEVOLVIDO'
        END,
        'quantidade_devolvida', p_quantidade_devolvida
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para listar atribuições por entidade
CREATE OR REPLACE FUNCTION public.listar_atribuicoes_entidade(
    p_tipo_entidade VARCHAR(20),
    p_entidade_id VARCHAR(100),
    p_apenas_ativas BOOLEAN DEFAULT true
)
RETURNS TABLE (
    atribuicao_id UUID,
    item_nome TEXT,
    item_categoria TEXT,
    quantidade_atribuida INTEGER,
    data_atribuicao TIMESTAMP WITH TIME ZONE,
    data_devolucao_prevista TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20),
    valor_responsabilidade DECIMAL(10,2),
    dias_restantes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as atribuicao_id,
        i.nome as item_nome,
        c.nome as item_categoria,
        a.quantidade_atribuida,
        a.data_atribuicao,
        a.data_devolucao_prevista,
        a.estado,
        a.valor_responsabilidade,
        CASE 
            WHEN a.data_devolucao_prevista IS NOT NULL 
            THEN EXTRACT(DAY FROM (a.data_devolucao_prevista - NOW()))::INTEGER
            ELSE NULL
        END as dias_restantes
    FROM public.atribuicoes_itens_2026_01_07_00_52 a
    JOIN public.itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
    JOIN public.tipos_aprovisionamento_2026_01_06 t ON i.tipo_id = t.id
    JOIN public.categorias_aprovisionamento_2026_01_06 c ON t.categoria_id = c.id
    WHERE 
        (p_tipo_entidade = 'VOLUNTARIO' AND a.voluntario_id = p_entidade_id) OR
        (p_tipo_entidade = 'ANIMAL' AND a.animal_id = p_entidade_id) OR
        (p_tipo_entidade = 'MISSAO' AND a.missao_id = p_entidade_id)
    AND (NOT p_apenas_ativas OR a.estado = 'ATIVO')
    ORDER BY a.data_atribuicao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;