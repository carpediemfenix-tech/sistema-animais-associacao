-- =====================================================
-- FUNÇÃO PARA ATUALIZAR STOCK COM VALIDAÇÕES
-- =====================================================

-- 1. CRIAR FUNÇÃO PARA ATUALIZAR STOCK
CREATE OR REPLACE FUNCTION public.atualizar_stock_item(
    p_item_id UUID,
    p_tipo_movimento VARCHAR(50),
    p_quantidade INTEGER,
    p_motivo TEXT DEFAULT NULL,
    p_documento_referencia VARCHAR(100) DEFAULT NULL,
    p_preco_unitario DECIMAL(10,2) DEFAULT NULL,
    p_voluntario_id VARCHAR(100) DEFAULT NULL,
    p_animal_id VARCHAR(100) DEFAULT NULL,
    p_missao_id VARCHAR(100) DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_quantidade_anterior INTEGER;
    v_quantidade_nova INTEGER;
    v_movimento_id UUID;
    v_user_id UUID;
BEGIN
    -- Obter user_id atual (pode ser null em contexto de sistema)
    v_user_id := auth.uid();
    
    -- Buscar item atual
    SELECT * INTO v_item 
    FROM public.itens_aprovisionamento_2026_01_06 
    WHERE id = p_item_id AND ativo = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Item não encontrado ou inativo');
    END IF;
    
    v_quantidade_anterior := v_item.quantidade_atual;
    
    -- Calcular nova quantidade baseada no tipo de movimento
    IF p_tipo_movimento IN ('ENTRADA_COMPRA', 'ENTRADA_DOACAO', 'ENTRADA_DEVOLUCAO', 'ENTRADA_AJUSTE') THEN
        v_quantidade_nova := v_quantidade_anterior + p_quantidade;
    ELSIF p_tipo_movimento IN ('SAIDA_CONSUMO', 'SAIDA_ATRIBUICAO', 'SAIDA_PERDA', 'SAIDA_AJUSTE') THEN
        v_quantidade_nova := v_quantidade_anterior - p_quantidade;
        
        -- Validar se há stock suficiente
        IF v_quantidade_nova < 0 THEN
            RETURN json_build_object('success', false, 'error', 'Stock insuficiente. Disponível: ' || v_quantidade_anterior);
        END IF;
    ELSE
        RETURN json_build_object('success', false, 'error', 'Tipo de movimento inválido');
    END IF;
    
    -- Atualizar quantidade do item
    UPDATE public.itens_aprovisionamento_2026_01_06 
    SET quantidade_atual = v_quantidade_nova,
        updated_by = v_user_id
    WHERE id = p_item_id;
    
    -- Registrar movimento (created_by pode ser null)
    INSERT INTO public.movimentos_stock_2026_01_06 (
        item_id, tipo_movimento, quantidade, quantidade_anterior, quantidade_nova,
        motivo, documento_referencia, preco_unitario,
        voluntario_id, animal_id, missao_id, observacoes, created_by
    ) VALUES (
        p_item_id, p_tipo_movimento, p_quantidade, v_quantidade_anterior, v_quantidade_nova,
        p_motivo, p_documento_referencia, p_preco_unitario,
        p_voluntario_id, p_animal_id, p_missao_id, p_observacoes, v_user_id
    ) RETURNING id INTO v_movimento_id;
    
    RETURN json_build_object(
        'success', true, 
        'movimento_id', v_movimento_id,
        'quantidade_anterior', v_quantidade_anterior,
        'quantidade_nova', v_quantidade_nova,
        'alerta_stock_baixo', v_quantidade_nova <= v_item.stock_minimo
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_itens_updated_at 
    BEFORE UPDATE ON public.itens_aprovisionamento_2026_01_06 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. TESTAR FUNÇÃO COM DADOS REAIS
-- Teste de entrada de stock
SELECT public.atualizar_stock_item(
    (SELECT id FROM public.itens_aprovisionamento_2026_01_06 WHERE nome = 'Ração Seca Cão Adulto 20kg'),
    'ENTRADA_COMPRA',
    10,
    'Compra de stock adicional para teste',
    'FAT-2026-001',
    35.00
) as teste_entrada_stock;

-- Teste de saída de stock
SELECT public.atualizar_stock_item(
    (SELECT id FROM public.itens_aprovisionamento_2026_01_06 WHERE nome = 'Blusão Valentão ao Resgate XXL'),
    'SAIDA_ATRIBUICAO',
    1,
    'Atribuído a voluntário para missão de resgate',
    NULL,
    NULL,
    'voluntario-123'
) as teste_saida_stock;

-- 4. VERIFICAR RESULTADOS DOS TESTES
SELECT 
    'APÓS TESTES DE MOVIMENTO' as status,
    i.nome,
    i.quantidade_atual,
    i.stock_minimo,
    i.alerta_stock_baixo,
    ROUND(i.valor_total_stock, 2) as valor_total
FROM public.itens_aprovisionamento_2026_01_06 i
WHERE i.nome IN ('Ração Seca Cão Adulto 20kg', 'Blusão Valentão ao Resgate XXL')
ORDER BY i.nome;

-- 5. VERIFICAR MOVIMENTOS REGISTRADOS
SELECT 
    'MOVIMENTOS REGISTRADOS' as status,
    COUNT(*) as total_movimentos
FROM public.movimentos_stock_2026_01_06;

SELECT 
    m.tipo_movimento,
    m.quantidade,
    m.quantidade_anterior,
    m.quantidade_nova,
    m.motivo,
    i.nome as item_nome,
    m.data_movimento
FROM public.movimentos_stock_2026_01_06 m
JOIN public.itens_aprovisionamento_2026_01_06 i ON m.item_id = i.id
ORDER BY m.data_movimento DESC
LIMIT 5;

-- 6. ESTATÍSTICAS FINAIS
SELECT 
    'ESTATÍSTICAS FINAIS' as titulo,
    (SELECT COUNT(*) FROM public.categorias_aprovisionamento_2026_01_06 WHERE ativo = true) as categorias,
    (SELECT COUNT(*) FROM public.tipos_aprovisionamento_2026_01_06 WHERE ativo = true) as tipos,
    (SELECT COUNT(*) FROM public.variacoes_aprovisionamento_2026_01_06 WHERE ativo = true) as variacoes,
    (SELECT COUNT(*) FROM public.itens_aprovisionamento_2026_01_06 WHERE ativo = true) as itens,
    (SELECT COUNT(*) FROM public.itens_aprovisionamento_2026_01_06 WHERE alerta_stock_baixo = true) as alertas_stock,
    (SELECT COUNT(*) FROM public.movimentos_stock_2026_01_06) as movimentos_stock,
    (SELECT ROUND(SUM(valor_total_stock), 2) FROM public.itens_aprovisionamento_2026_01_06 WHERE ativo = true) as valor_total;