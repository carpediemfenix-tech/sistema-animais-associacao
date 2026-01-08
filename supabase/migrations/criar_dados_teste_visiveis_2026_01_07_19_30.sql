-- CRIAR DADOS DE TESTE VISÍVEIS PARA DEVOLUÇÃO PARCIAL
-- Dados que o utilizador pode facilmente identificar no ecrã

-- 1. Criar item facilmente identificável
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
    'TESTE DEVOLUÇÃO - Caneca Azul',
    'Item criado especificamente para testar devolução parcial',
    100, -- Stock alto para não haver problemas
    5,
    3.50,
    (SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE ativo = true LIMIT 1),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM itens_aprovisionamento_2026_01_06 
    WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
);

-- 2. Criar atribuição facilmente identificável
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
    (SELECT id FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul' LIMIT 1),
    'VOLUNTARIO',
    'TESTE - Maria Santos (Devolução Parcial)',
    10, -- 10 unidades para testar
    0,  -- Nenhuma devolvida ainda
    10, -- 10 restantes
    'ATIVO',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '15 days',
    'Teste de devolução parcial - 10 unidades',
    'CENÁRIO: Devolver 4 unidades, ficar com 6 restantes',
    35.00, -- 10 × 3.50
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul')
AND NOT EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 
    WHERE entidade_nome = 'TESTE - Maria Santos (Devolução Parcial)'
);

-- 3. Atualizar stock do item (reduzir as 10 unidades atribuídas)
UPDATE itens_aprovisionamento_2026_01_06 
SET 
    quantidade_atual = quantidade_atual - 10,
    updated_at = NOW()
WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 
    WHERE entidade_nome = 'TESTE - Maria Santos (Devolução Parcial)'
    AND item_id = itens_aprovisionamento_2026_01_06.id
);

-- 4. Registrar movimento de stock inicial
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
    i.quantidade_atual + 10,
    i.quantidade_atual,
    'Atribuição para teste',
    'Atribuição de teste: 10 Canecas Azuis para Maria Santos',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '1 day'
FROM itens_aprovisionamento_2026_01_06 i
WHERE i.nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 a
    WHERE a.entidade_nome = 'TESTE - Maria Santos (Devolução Parcial)'
    AND a.item_id = i.id
)
AND NOT EXISTS (
    SELECT 1 FROM movimentos_stock_2026_01_06 m
    WHERE m.item_id = i.id 
    AND m.observacoes LIKE '%Maria Santos%'
);

-- 5. Verificar dados criados
SELECT 
    'RESUMO DOS DADOS DE TESTE' as info,
    '' as item,
    '' as entidade,
    '' as quantidade,
    '' as estado;

SELECT 
    'ITEM' as info,
    i.nome as item,
    '' as entidade,
    i.quantidade_atual::text as quantidade,
    CASE WHEN i.ativo THEN 'ATIVO' ELSE 'INATIVO' END as estado
FROM itens_aprovisionamento_2026_01_06 i
WHERE i.nome = 'TESTE DEVOLUÇÃO - Caneca Azul'

UNION ALL

SELECT 
    'ATRIBUIÇÃO' as info,
    i.nome as item,
    a.entidade_nome as entidade,
    (a.quantidade_atribuida::text || ' atribuídas, ' || a.quantidade_restante::text || ' restantes') as quantidade,
    a.estado
FROM atribuicoes_itens_2026_01_07_00_52 a
JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
WHERE a.entidade_nome = 'TESTE - Maria Santos (Devolução Parcial)';

-- 6. Instruções para o teste
DO $$
BEGIN
    RAISE NOTICE '=== DADOS DE TESTE CRIADOS ===';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 COMO TESTAR:';
    RAISE NOTICE '1. Ir para: /aprovisionamento/atribuicoes';
    RAISE NOTICE '2. Procurar por: "TESTE - Maria Santos (Devolução Parcial)"';
    RAISE NOTICE '3. Item: "TESTE DEVOLUÇÃO - Caneca Azul"';
    RAISE NOTICE '4. Quantidade: 10 atribuídas, 10 restantes';
    RAISE NOTICE '5. Clicar no botão "Devolver"';
    RAISE NOTICE '6. Testar devolver 4 unidades';
    RAISE NOTICE '7. Resultado esperado: 6 restantes, stock +4';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Se aparecer esta atribuição na lista, os dados foram criados!';
    RAISE NOTICE '❌ Se não aparecer, verificar se há problemas na consulta SQL';
END;
$$;