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
    'João Silva (Voluntário Teste)',
    10, -- 10 unidades atribuídas
    0,  -- Nenhuma devolvida ainda
    10, -- 10 restantes
    'ATIVO',
    NOW() - INTERVAL '7 days', -- Atribuído há 7 dias
    NOW() + INTERVAL '30 days', -- Devolução prevista em 30 dias
    'Distribuição de material promocional',
    'Canecas para evento de angariação de fundos',
    59.90, -- 10 × 5.99
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026')
AND NOT EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 
    WHERE entidade_nome = 'João Silva (Voluntário Teste)'
    AND item_id = (SELECT id FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026' LIMIT 1)
);

-- Atualizar stock do item (reduzir 10 unidades que foram atribuídas)
UPDATE itens_aprovisionamento_2026_01_06 
SET 
    quantidade_atual = GREATEST(quantidade_atual - 10, 0),
    updated_at = NOW()
WHERE nome = 'Caneca 2026'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 
    WHERE entidade_nome = 'João Silva (Voluntário Teste)'
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
    'Atribuição inicial de 10 Canecas 2026 para João Silva',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '7 days'
FROM itens_aprovisionamento_2026_01_06 i
WHERE i.nome = 'Caneca 2026'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 a
    WHERE a.entidade_nome = 'João Silva (Voluntário Teste)'
    AND a.item_id = i.id
)
AND NOT EXISTS (
    SELECT 1 FROM movimentos_stock_2026_01_06 m
    WHERE m.item_id = i.id 
    AND m.observacoes LIKE '%João Silva%'
);

-- Verificar dados criados
SELECT 
    'ITEM' as tipo,
    i.nome,
    i.quantidade_atual::text as info1,
    i.stock_minimo::text as info2,
    i.preco_unitario::text as info3
FROM itens_aprovisionamento_2026_01_06 i
WHERE i.nome = 'Caneca 2026'

UNION ALL

SELECT 
    'ATRIBUIÇÃO' as tipo,
    a.entidade_nome as nome,
    a.quantidade_atribuida::text as info1,
    a.quantidade_devolvida::text as info2,
    a.quantidade_restante::text as info3
FROM atribuicoes_itens_2026_01_07_00_52 a
JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
WHERE i.nome = 'Caneca 2026'
AND a.entidade_nome = 'João Silva (Voluntário Teste)';

-- Mostrar instruções para teste
DO $$
BEGIN
    RAISE NOTICE '=== CENÁRIO DE TESTE CRIADO ===';
    RAISE NOTICE 'Item: Caneca 2026';
    RAISE NOTICE 'Voluntário: João Silva (Voluntário Teste)';
    RAISE NOTICE 'Quantidade atribuída: 10 unidades';
    RAISE NOTICE 'Estado: ATIVO (pronto para devolução parcial)';
    RAISE NOTICE '';
    RAISE NOTICE 'TESTE SUGERIDO:';
    RAISE NOTICE '1. Ir para /aprovisionamento/atribuicoes';
    RAISE NOTICE '2. Encontrar atribuição de João Silva';
    RAISE NOTICE '3. Clicar em "Devolver"';
    RAISE NOTICE '4. Devolver 5 unidades';
    RAISE NOTICE '5. Verificar que ficam 5 por devolver';
    RAISE NOTICE '6. Verificar que stock aumentou em 5';
END;
$$;