-- IDENTIFICAR ATRIBUIÇÃO EXISTENTE PARA TESTE
-- Buscar atribuições ativas que podem ser usadas para teste

-- 1. Listar atribuições ativas disponíveis para teste
SELECT 
    a.id,
    i.nome as item_nome,
    a.tipo_atribuicao,
    a.quantidade_atribuida,
    COALESCE(a.quantidade_devolvida, 0) as quantidade_devolvida,
    COALESCE(a.quantidade_restante, a.quantidade_atribuida) as quantidade_restante,
    a.estado,
    a.data_atribuicao
FROM atribuicoes_itens_2026_01_07_00_52 a
JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
WHERE a.estado IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO')
AND COALESCE(a.quantidade_restante, a.quantidade_atribuida) > 0
ORDER BY a.created_at DESC
LIMIT 5;

-- 2. Se não houver atribuições, criar uma simples para teste
INSERT INTO atribuicoes_itens_2026_01_07_00_52 (
    id,
    item_id,
    tipo_atribuicao,
    quantidade_atribuida,
    quantidade_devolvida,
    quantidade_restante,
    estado,
    data_atribuicao,
    motivo,
    created_by,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    (SELECT id FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul' LIMIT 1),
    'VOLUNTARIO',
    10, -- 10 unidades
    0,  -- Nenhuma devolvida
    10, -- 10 restantes
    'ATIVO',
    NOW() - INTERVAL '1 day',
    'Teste de devolução parcial - Maria Santos',
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul')
AND NOT EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 a
    JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
    WHERE i.nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
);

-- 3. Atualizar stock do item (reduzir 10 unidades)
UPDATE itens_aprovisionamento_2026_01_06 
SET 
    quantidade_atual = quantidade_atual - 10,
    updated_at = NOW()
WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
AND EXISTS (
    SELECT 1 FROM atribuicoes_itens_2026_01_07_00_52 a
    WHERE a.item_id = itens_aprovisionamento_2026_01_06.id
    AND a.estado = 'ATIVO'
);

-- 4. Mostrar resultado final
SELECT 
    'DADOS FINAIS PARA TESTE' as status,
    i.nome as item,
    i.quantidade_atual as stock_disponivel,
    a.quantidade_atribuida as quantidade_atribuida,
    a.quantidade_restante as quantidade_restante,
    a.estado,
    a.id as atribuicao_id
FROM atribuicoes_itens_2026_01_07_00_52 a
JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
WHERE i.nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
AND a.estado = 'ATIVO';

-- 5. Instruções finais
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM atribuicoes_itens_2026_01_07_00_52 a
    JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
    WHERE i.nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
    AND a.estado = 'ATIVO';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ DADOS DE TESTE PRONTOS!';
        RAISE NOTICE '';
        RAISE NOTICE '🎯 COMO TESTAR:';
        RAISE NOTICE '1. Ir para: /aprovisionamento/atribuicoes';
        RAISE NOTICE '2. Procurar item: "TESTE DEVOLUÇÃO - Caneca Azul"';
        RAISE NOTICE '3. Deve aparecer com badge "TESTE" azul';
        RAISE NOTICE '4. Clicar "Devolver" na atribuição';
        RAISE NOTICE '5. Testar devolver 4 unidades (de 10)';
        RAISE NOTICE '6. Verificar: 6 restantes, stock +4';
    ELSE
        RAISE NOTICE '❌ Problema na criação dos dados de teste';
    END IF;
END;
$$;