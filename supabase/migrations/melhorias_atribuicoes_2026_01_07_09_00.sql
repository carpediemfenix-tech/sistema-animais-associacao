-- =====================================================
-- MELHORIAS NO SISTEMA DE ATRIBUIÇÕES
-- Data: 2026-01-07 09:00 UTC
-- =====================================================

-- 1. Adicionar suporte a GRUPOS na tabela de atribuições
ALTER TABLE public.atribuicoes_itens_2026_01_07_00_52 
ADD COLUMN IF NOT EXISTS grupo_id VARCHAR(100);

-- Atualizar o tipo de atribuição para incluir GRUPO
ALTER TABLE public.atribuicoes_itens_2026_01_07_00_52 
DROP CONSTRAINT IF EXISTS atribuicoes_itens_2026_01_07_00_52_tipo_atribuicao_check;

ALTER TABLE public.atribuicoes_itens_2026_01_07_00_52 
ADD CONSTRAINT atribuicoes_itens_2026_01_07_00_52_tipo_atribuicao_check 
CHECK (tipo_atribuicao IN ('VOLUNTARIO', 'ANIMAL', 'MISSAO', 'GRUPO'));

-- 2. Adicionar campos para devolução parcial
ALTER TABLE public.atribuicoes_itens_2026_01_07_00_52 
ADD COLUMN IF NOT EXISTS quantidade_devolvida INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantidade_restante INTEGER;

-- Função para calcular quantidade restante automaticamente
CREATE OR REPLACE FUNCTION public.calcular_quantidade_restante()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular quantidade restante
    NEW.quantidade_restante = NEW.quantidade_atribuida - COALESCE(NEW.quantidade_devolvida, 0);
    
    -- Atualizar estado baseado na quantidade restante
    IF NEW.quantidade_restante <= 0 THEN
        NEW.estado = 'DEVOLVIDO';
    ELSIF NEW.quantidade_devolvida > 0 THEN
        NEW.estado = 'PARCIALMENTE_DEVOLVIDO';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular quantidade restante
DROP TRIGGER IF EXISTS trigger_calcular_quantidade_restante ON public.atribuicoes_itens_2026_01_07_00_52;
CREATE TRIGGER trigger_calcular_quantidade_restante
    BEFORE INSERT OR UPDATE ON public.atribuicoes_itens_2026_01_07_00_52
    FOR EACH ROW
    EXECUTE FUNCTION public.calcular_quantidade_restante();

-- 3. Atualizar tabela de configurações para incluir grupos
ALTER TABLE public.config_atribuicoes_2026_01_07_00_52 
ADD COLUMN IF NOT EXISTS permite_grupos BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quantidade_maxima_por_grupo INTEGER;

-- 4. Atualizar estados possíveis para incluir devolução parcial
ALTER TABLE public.estados_itens_2026_01_07_00_52 
DROP CONSTRAINT IF EXISTS estados_itens_2026_01_07_00_52_estado_check;

ALTER TABLE public.estados_itens_2026_01_07_00_52 
ADD CONSTRAINT estados_itens_2026_01_07_00_52_estado_check 
CHECK (estado IN ('DISPONIVEL', 'ATRIBUIDO', 'EM_USO', 'EM_VERIFICACAO', 'CONSUMIDO', 'PERDIDO', 'DANIFICADO', 'PARCIALMENTE_DEVOLVIDO'));

-- 5. Função melhorada para processar devolução (agora suporta devolução parcial)
CREATE OR REPLACE FUNCTION public.processar_devolucao_parcial_item(
    p_atribuicao_id UUID,
    p_quantidade_devolver INTEGER,
    p_estado_devolucao VARCHAR DEFAULT 'BOM',
    p_observacoes_verificacao TEXT DEFAULT NULL,
    p_verificado_por UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_atribuicao RECORD;
    v_nova_quantidade_devolvida INTEGER;
    v_quantidade_restante INTEGER;
    v_novo_estado VARCHAR;
    v_result JSON;
BEGIN
    -- Buscar atribuição
    SELECT * INTO v_atribuicao 
    FROM public.atribuicoes_itens_2026_01_07_00_52 
    WHERE id = p_atribuicao_id AND estado IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO');
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Atribuição não encontrada ou já devolvida completamente'
        );
    END IF;
    
    -- Validar quantidade a devolver
    v_nova_quantidade_devolvida = COALESCE(v_atribuicao.quantidade_devolvida, 0) + p_quantidade_devolver;
    
    IF v_nova_quantidade_devolvida > v_atribuicao.quantidade_atribuida THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Quantidade a devolver excede a quantidade atribuída'
        );
    END IF;
    
    -- Calcular quantidade restante
    v_quantidade_restante = v_atribuicao.quantidade_atribuida - v_nova_quantidade_devolvida;
    
    -- Determinar novo estado
    IF v_quantidade_restante = 0 THEN
        v_novo_estado = 'DEVOLVIDO';
    ELSE
        v_novo_estado = 'PARCIALMENTE_DEVOLVIDO';
    END IF;
    
    -- Atualizar atribuição
    UPDATE public.atribuicoes_itens_2026_01_07_00_52 
    SET 
        quantidade_devolvida = v_nova_quantidade_devolvida,
        quantidade_restante = v_quantidade_restante,
        estado = v_novo_estado,
        data_devolucao_real = CASE 
            WHEN v_novo_estado = 'DEVOLVIDO' THEN NOW() 
            ELSE data_devolucao_real 
        END,
        estado_devolucao = p_estado_devolucao,
        observacoes_verificacao = p_observacoes_verificacao,
        verificado_por = COALESCE(p_verificado_por, auth.uid()),
        data_verificacao = NOW(),
        updated_at = NOW()
    WHERE id = p_atribuicao_id;
    
    -- Atualizar stock do item (devolver ao stock)
    UPDATE public.itens_aprovisionamento_2026_01_06 
    SET 
        quantidade_atual = quantidade_atual + p_quantidade_devolver,
        updated_at = NOW()
    WHERE id = v_atribuicao.item_id;
    
    -- Registrar movimento de stock
    INSERT INTO public.movimentos_stock_2026_01_06 (
        item_id,
        tipo_movimento,
        quantidade,
        motivo,
        documento_referencia,
        observacoes,
        created_by
    ) VALUES (
        v_atribuicao.item_id,
        'ENTRADA_DEVOLUCAO',
        p_quantidade_devolver,
        'Devolução parcial de atribuição',
        'ATRIB-' || p_atribuicao_id::text,
        p_observacoes_verificacao,
        COALESCE(p_verificado_por, auth.uid())
    );
    
    -- Registrar estado do item
    INSERT INTO public.estados_itens_2026_01_07_00_52 (
        atribuicao_id,
        estado,
        data_mudanca,
        observacoes,
        responsavel_mudanca
    ) VALUES (
        p_atribuicao_id,
        CASE WHEN v_novo_estado = 'DEVOLVIDO' THEN 'DISPONIVEL' ELSE 'PARCIALMENTE_DEVOLVIDO' END,
        NOW(),
        'Devolução parcial: ' || p_quantidade_devolver || ' unidades',
        COALESCE(p_verificado_por, auth.uid())
    );
    
    -- Preparar resultado
    v_result = json_build_object(
        'success', true,
        'atribuicao_id', p_atribuicao_id,
        'quantidade_devolvida_total', v_nova_quantidade_devolvida,
        'quantidade_restante', v_quantidade_restante,
        'estado_final', v_novo_estado,
        'devolucao_completa', (v_novo_estado = 'DEVOLVIDO')
    );
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atualizar dados existentes para incluir quantidade_restante
UPDATE public.atribuicoes_itens_2026_01_07_00_52 
SET 
    quantidade_devolvida = CASE 
        WHEN estado = 'DEVOLVIDO' THEN quantidade_atribuida 
        ELSE 0 
    END,
    quantidade_restante = CASE 
        WHEN estado = 'DEVOLVIDO' THEN 0 
        ELSE quantidade_atribuida 
    END
WHERE quantidade_restante IS NULL;

-- 7. Atualizar configurações existentes para incluir grupos
UPDATE public.config_atribuicoes_2026_01_07_00_52 
SET permite_grupos = true 
WHERE permite_grupos IS NULL;

-- 8. Inserir configurações padrão para grupos nas categorias existentes
INSERT INTO public.config_atribuicoes_2026_01_07_00_52 (
    categoria_id,
    permite_voluntarios,
    permite_animais,
    permite_missoes,
    permite_grupos,
    quantidade_maxima_por_grupo,
    prazo_devolucao_dias,
    requer_verificacao,
    permite_consumo,
    valor_responsabilidade_padrao
)
SELECT 
    c.id,
    true,
    true,
    true,
    true,
    10, -- Máximo 10 itens por grupo por padrão
    30,
    false,
    false,
    NULL
FROM public.categorias_aprovisionamento_2026_01_06 c
WHERE c.ativo = true 
AND NOT EXISTS (
    SELECT 1 FROM public.config_atribuicoes_2026_01_07_00_52 cfg 
    WHERE cfg.categoria_id = c.id
)
ON CONFLICT DO NOTHING;

-- 9. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atribuicoes_grupo_id ON public.atribuicoes_itens_2026_01_07_00_52(grupo_id);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_quantidade_restante ON public.atribuicoes_itens_2026_01_07_00_52(quantidade_restante);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_estado_tipo ON public.atribuicoes_itens_2026_01_07_00_52(estado, tipo_atribuicao);

-- 10. Atualizar políticas RLS para incluir grupos
DROP POLICY IF EXISTS "Permitir acesso a atribuições" ON public.atribuicoes_itens_2026_01_07_00_52;
CREATE POLICY "Permitir acesso a atribuições" ON public.atribuicoes_itens_2026_01_07_00_52
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir acesso a configurações" ON public.config_atribuicoes_2026_01_07_00_52;
CREATE POLICY "Permitir acesso a configurações" ON public.config_atribuicoes_2026_01_07_00_52
    FOR ALL USING (auth.role() = 'authenticated');

-- 11. Comentários para documentação
COMMENT ON COLUMN public.atribuicoes_itens_2026_01_07_00_52.grupo_id IS 'ID do grupo de animais (quando tipo_atribuicao = GRUPO)';
COMMENT ON COLUMN public.atribuicoes_itens_2026_01_07_00_52.quantidade_devolvida IS 'Quantidade já devolvida (para devolução parcial)';
COMMENT ON COLUMN public.atribuicoes_itens_2026_01_07_00_52.quantidade_restante IS 'Quantidade ainda por devolver (calculada automaticamente)';
COMMENT ON COLUMN public.config_atribuicoes_2026_01_07_00_52.permite_grupos IS 'Se permite atribuições a grupos de animais';
COMMENT ON COLUMN public.config_atribuicoes_2026_01_07_00_52.quantidade_maxima_por_grupo IS 'Quantidade máxima de itens por grupo';

COMMENT ON FUNCTION public.processar_devolucao_parcial_item IS 'Processa devolução parcial de itens, permitindo devolver apenas parte da quantidade atribuída';

-- Verificação final
SELECT 
    'Melhorias implementadas com sucesso!' as status,
    COUNT(*) as total_configuracoes
FROM public.config_atribuicoes_2026_01_07_00_52;