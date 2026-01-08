-- CRIAR ATRIBUIÇÃO DE TESTE SIMPLES (sem foreign keys problemáticas)

-- 1. Verificar se o item de teste existe
SELECT 
    'VERIFICAÇÃO ITEM' as status,
    nome,
    quantidade_atual,
    id
FROM itens_aprovisionamento_2026_01_06 
WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul';

-- 2. Listar atribuições existentes para ver se já temos dados para teste
SELECT 
    'ATRIBUIÇÕES EXISTENTES' as status,
    COUNT(*) as total,
    'Podemos usar uma existente' as opcao
FROM atribuicoes_itens_2026_01_07_00_52
WHERE estado IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO')
AND quantidade_restante > 0;

-- 3. Mostrar atribuições disponíveis para teste
SELECT 
    'ATRIBUIÇÃO DISPONÍVEL' as status,
    a.id,
    i.nome as item_nome,
    a.quantidade_atribuida,
    COALESCE(a.quantidade_restante, a.quantidade_atribuida) as restante,
    a.estado
FROM atribuicoes_itens_2026_01_07_00_52 a
JOIN itens_aprovisionamento_2026_01_06 i ON a.item_id = i.id
WHERE a.estado IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO')
AND COALESCE(a.quantidade_restante, a.quantidade_atribuida) > 0
ORDER BY a.created_at DESC
LIMIT 3;

-- 4. Instruções baseadas no que encontramos
DO $$
DECLARE
    v_count INTEGER;
    v_item_exists BOOLEAN;
BEGIN
    -- Verificar se o item de teste existe
    SELECT EXISTS(
        SELECT 1 FROM itens_aprovisionamento_2026_01_06 
        WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul'
    ) INTO v_item_exists;
    
    -- Contar atribuições disponíveis
    SELECT COUNT(*) INTO v_count
    FROM atribuicoes_itens_2026_01_07_00_52
    WHERE estado IN ('ATIVO', 'PARCIALMENTE_DEVOLVIDO')
    AND quantidade_restante > 0;
    
    RAISE NOTICE '=== STATUS DOS DADOS DE TESTE ===';
    
    IF v_item_exists THEN
        RAISE NOTICE '✅ Item "TESTE DEVOLUÇÃO - Caneca Azul" existe';
    ELSE
        RAISE NOTICE '❌ Item de teste não existe';
    END IF;
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ % atribuições disponíveis para teste', v_count;
        RAISE NOTICE '';
        RAISE NOTICE '🎯 COMO TESTAR:';
        RAISE NOTICE '1. Ir para: /aprovisionamento/atribuicoes';
        RAISE NOTICE '2. Procurar qualquer atribuição com estado ATIVO';
        RAISE NOTICE '3. Clicar "Devolver" numa atribuição';
        RAISE NOTICE '4. Testar devolução parcial';
        RAISE NOTICE '5. Verificar se a função processar_devolucao_parcial_v2 funciona';
    ELSE
        RAISE NOTICE '❌ Nenhuma atribuição disponível para teste';
        RAISE NOTICE 'Precisa criar dados manualmente via interface';
    END IF;
END;
$$;