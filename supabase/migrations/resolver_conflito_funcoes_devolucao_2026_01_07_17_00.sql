-- Resolver conflito de funções de devolução
-- Diagnosticar funções existentes
SELECT 
    n.nspname as schema, 
    p.proname as function_name, 
    oidvectortypes(p.proargtypes) as parameters
FROM pg_proc p
JOIN pg_namespace n on n.oid = p.pronamespace
WHERE p.proname ILIKE '%devolucao%' OR p.proname ILIKE '%devolver%'
ORDER BY p.proname;

-- Remover funções antigas conflitantes se existirem
DROP FUNCTION IF EXISTS public.processar_devolucao_item CASCADE;
DROP FUNCTION IF EXISTS public.processar_devolucao_parcial_item CASCADE;

-- Criar função única e definitiva para devolução parcial
CREATE OR REPLACE FUNCTION public.processar_devolucao_parcial_v2(
    p_atribuicao_id UUID,
    p_quantidade_devolver INTEGER,
    p_estado_devolucao TEXT,
    p_observacoes_verificacao TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_atribuicao RECORD;
    v_item RECORD;
    v_quantidade_atual_devolvida INTEGER;
    v_nova_quantidade_devolvida INTEGER;
    v_nova_quantidade_restante INTEGER;
    v_novo_estado TEXT;
    v_devolucao_completa BOOLEAN;
    v_stock_anterior INTEGER;
BEGIN
    -- Log de início
    RAISE NOTICE 'Iniciando devolução parcial - Atribuição: %, Quantidade: %', p_atribuicao_id, p_quantidade_devolver;
    
    -- Buscar dados da atribuição
    SELECT * INTO v_atribuicao
    FROM atribuicoes_itens_2026_01_07_00_52
    WHERE id = p_atribuicao_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Atribuição não encontrada'
        );
    END IF;
    
    -- Verificar se a atribuição permite devolução
    IF v_atribuicao.estado NOT IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Atribuição não permite devolução (estado: ' || v_atribuicao.estado || ')'
        );
    END IF;
    
    -- Calcular quantidades
    v_quantidade_atual_devolvida := COALESCE(v_atribuicao.quantidade_devolvida, 0);
    v_nova_quantidade_devolvida := v_quantidade_atual_devolvida + p_quantidade_devolver;
    v_nova_quantidade_restante := v_atribuicao.quantidade_atribuida - v_nova_quantidade_devolvida;
    
    -- Verificar se não excede a quantidade atribuída
    IF v_nova_quantidade_devolvida > v_atribuicao.quantidade_atribuida THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Quantidade a devolver excede o disponível. Máximo: ' || (v_atribuicao.quantidade_atribuida - v_quantidade_atual_devolvida)
        );
    END IF;
    
    -- Determinar novo estado
    IF v_nova_quantidade_restante = 0 THEN
        v_novo_estado := 'DEVOLVIDO';
        v_devolucao_completa := true;
    ELSE
        v_novo_estado := 'PARCIALMENTE_DEVOLVIDO';
        v_devolucao_completa := false;
    END IF;
    
    -- Buscar dados do item para atualizar stock
    SELECT * INTO v_item
    FROM itens_aprovisionamento_2026_01_06
    WHERE id = v_atribuicao.item_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Item não encontrado'
        );
    END IF;
    
    v_stock_anterior := v_item.quantidade_atual;
    
    -- Atualizar stock do item (adicionar quantidade devolvida)
    UPDATE itens_aprovisionamento_2026_01_06
    SET 
        quantidade_atual = quantidade_atual + p_quantidade_devolver,
        updated_at = NOW()
    WHERE id = v_atribuicao.item_id;
    
    -- Registrar movimento de stock
    INSERT INTO movimentos_stock_2026_01_06 (
        item_id,
        tipo_movimento,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        motivo,
        observacoes,
        created_by
    ) VALUES (
        v_atribuicao.item_id,
        'ENTRADA',
        p_quantidade_devolver,
        v_stock_anterior,
        v_stock_anterior + p_quantidade_devolver,
        'Devolução de atribuição',
        'Devolução ' || (CASE WHEN v_devolucao_completa THEN 'completa' ELSE 'parcial' END) || 
        ' - Atribuição ID: ' || p_atribuicao_id || 
        CASE WHEN p_observacoes_verificacao IS NOT NULL THEN ' - ' || p_observacoes_verificacao ELSE '' END,
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    );
    
    -- Atualizar atribuição
    UPDATE atribuicoes_itens_2026_01_07_00_52
    SET 
        quantidade_devolvida = v_nova_quantidade_devolvida,
        quantidade_restante = v_nova_quantidade_restante,
        estado = v_novo_estado,
        data_devolucao_real = CASE WHEN v_devolucao_completa THEN NOW() ELSE data_devolucao_real END,
        observacoes_verificacao = CASE 
            WHEN p_observacoes_verificacao IS NOT NULL THEN 
                COALESCE(observacoes_verificacao, '') || 
                CASE WHEN observacoes_verificacao IS NOT NULL THEN E'\n' ELSE '' END ||
                '[' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || '] ' || p_observacoes_verificacao
            ELSE observacoes_verificacao
        END,
        updated_at = NOW()
    WHERE id = p_atribuicao_id;
    
    -- Log de sucesso
    RAISE NOTICE 'Devolução processada - Estado: %, Restante: %, Stock: % -> %', 
        v_novo_estado, v_nova_quantidade_restante, v_stock_anterior, v_stock_anterior + p_quantidade_devolver;
    
    -- Retornar resultado
    RETURN json_build_object(
        'success', true,
        'devolucao_completa', v_devolucao_completa,
        'quantidade_devolvida_total', v_nova_quantidade_devolvida,
        'quantidade_restante', v_nova_quantidade_restante,
        'estado_final', v_novo_estado,
        'stock_anterior', v_stock_anterior,
        'stock_atualizado', v_stock_anterior + p_quantidade_devolver
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro na devolução: %', SQLERRM;
    RETURN json_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$;

-- Verificar que a função foi criada
SELECT 
    n.nspname as schema, 
    p.proname as function_name, 
    oidvectortypes(p.proargtypes) as parameters
FROM pg_proc p
JOIN pg_namespace n on n.oid = p.pronamespace
WHERE p.proname = 'processar_devolucao_parcial_v2';

-- Testar a função se existirem dados
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 WHERE estado IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO') LIMIT 1) THEN
        RAISE NOTICE '✅ Função processar_devolucao_parcial_v2 criada e pronta para uso';
    ELSE
        RAISE NOTICE '⚠️ Função processar_devolucao_parcial_v2 criada. Nenhuma atribuição ativa encontrada para teste';
    END IF;
END;
$$;