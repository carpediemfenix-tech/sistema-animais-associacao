-- Criar dados de teste para validar devolução parcial
-- Inserir item "Caneca 2026" se não existir
INSERT INTO itens_aprovisionamento_2026_01_06 (
    id,
    nome,
    descricao,
    quantidade_atual,
    stock_minimo,
    preco_unitario,
    tipo_id,
    ativo,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'Caneca 2026',
    'Caneca comemorativa do ano 2026 para voluntários',
    40, -- Stock inicial de 40 unidades (será reduzido para 30 após atribuição)
    10, -- Stock mínimo
    5.99, -- Preço unitário
    (SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE ativo = true LIMIT 1),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026'
);

-- Criar atribuição de teste: 10 Canecas para um voluntário
INSERT INTO atribuicoes_itens_2026_01_07_00_52 (
    id,
    item_id,
    tipo_atribuicao,
    entidade_nome,
    quantidade_atribuida,
    quantidade_devolvida,
    quantidade_restante,
    estado,
    data_atribuicao,
    data_devolucao_prevista,
    motivo,
    observacoes,
    valor_responsabilidade,
    created_by,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    (SELECT id FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026' LIMIT 1),
    'VOLUNTARIO',
    'João Silva (Teste Devolução Parcial)',
    10, -- 10 unidades atribuídas
    0,  -- Nenhuma devolvida ainda
    10, -- 10 restantes
    'ATIVO',
    NOW() - INTERVAL '7 days', -- Atribuído há 7 dias
    NOW() + INTERVAL '30 days', -- Devolução prevista em 30 dias
    'Teste de devolução parcial',
    'Cenário: 10 Canecas → devolver 5 → ficar 5 restantes',
    59.90, -- 10 × 5.99
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026')
AND NOT EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 
    WHERE entidade_nome = 'João Silva (Teste Devolução Parcial)'
);

-- Atualizar stock do item (reduzir 10 unidades que foram atribuídas)
UPDATE itens_aprovisionamento_2026_01_06 
SET 
    quantidade_atual = GREATEST(quantidade_atual - 10, 0),
    updated_at = NOW()
WHERE nome = 'Caneca 2026'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 
    WHERE entidade_nome = 'João Silva (Teste Devolução Parcial)'
    AND item_id = itens_aprovisionamento_2026_01_06.id
);

-- Registrar movimento de stock da atribuição inicial
INSERT INTO movimentos_stock_2026_01_06 (
    item_id,
    tipo_movimento,
    quantidade,
    quantidade_anterior,
    quantidade_nova,
    motivo,
    observacoes,
    created_by,
    created_at
) 
SELECT 
    i.id,
    'SAIDA',
    10,
    i.quantidade_atual + 10, -- Quantidade antes da atribuição
    i.quantidade_atual,      -- Quantidade atual
    'Atribuição para voluntário',
    'Atribuição inicial de 10 Canecas 2026 para João Silva (Teste)',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '7 days'
FROM itens_aprovisionamento_2026_01_06 i
WHERE i.nome = 'Caneca 2026'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 a
    WHERE a.entidade_nome = 'João Silva (Teste Devolução Parcial)'
    AND a.item_id = i.id
)
AND NOT EXISTS (
    SELECT 1 FROM movimentos_stock_2026_01_06 m
    WHERE m.item_id = i.id 
    AND m.observacoes LIKE '%João Silva (Teste)%'
);

-- Verificar dados criados
SELECT 
    'ITEM' as tipo,
    i.nome,
    i.quantidade_atual::text as quantidade_atual,
    i.stock_minimo::text as stock_minimo,
    'Stock disponível' as status
FROM itens_aprovisionamento_2026_01_06 i
WHERE i.nome = 'Caneca 2026'

UNION ALL

SELECT 
    'ATRIBUIÇÃO' as tipo,
    a.entidade_nome as nome,
    a.quantidade_atribuida::text as quantidade_atual,
    a.quantidade_restante::text as stock_minimo,
    a.estado as status
FROM atribuicoes_itens_2026_01_07_00_52 a
JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
WHERE i.nome = 'Caneca 2026'
AND a.entidade_nome = 'João Silva (Teste Devolução Parcial)';

-- Testar a função com dados reais
DO $$
DECLARE
    v_atribuicao_id UUID;
    v_resultado JSON;
BEGIN
    -- Buscar ID da atribuição de teste
    SELECT id INTO v_atribuicao_id
    FROM atribuicoes_itens_2026_01_07_00_52
    WHERE entidade_nome = 'João Silva (Teste Devolução Parcial)'
    AND estado = 'ATIVO'
    LIMIT 1;
    
    IF v_atribuicao_id IS NOT NULL THEN
        RAISE NOTICE '=== DADOS DE TESTE CRIADOS ===';
        RAISE NOTICE 'Item: Caneca 2026';
        RAISE NOTICE 'Voluntário: João Silva (Teste Devolução Parcial)';
        RAISE NOTICE 'Atribuição ID: %', v_atribuicao_id;
        RAISE NOTICE 'Quantidade atribuída: 10 unidades';
        RAISE NOTICE 'Estado: ATIVO (pronto para teste)';
        RAISE NOTICE '';
        RAISE NOTICE 'TESTE MANUAL:';
        RAISE NOTICE '1. Ir para /aprovisionamento/atribuicoes';
        RAISE NOTICE '2. Encontrar "João Silva (Teste Devolução Parcial)"';
        RAISE NOTICE '3. Clicar em "Devolver"';
        RAISE NOTICE '4. Devolver 5 unidades';
        RAISE NOTICE '5. Verificar resultado esperado:';
        RAISE NOTICE '   - Estado: PARCIALMENTE_DEVOLVIDO';
        RAISE NOTICE '   - Restantes: 5 unidades';
        RAISE NOTICE '   - Stock: +5 unidades';
    ELSE
        RAISE NOTICE '⚠️ Não foi possível criar dados de teste';
    END IF;
END;
$$;