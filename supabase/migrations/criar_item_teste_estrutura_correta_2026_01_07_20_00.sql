-- CRIAR DADOS DE TESTE COM ESTRUTURA CORRETA
-- Primeiro verificar se já existem dados de teste

-- 1. Criar item de teste se não existir
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
    100, -- Stock alto
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

-- 2. Verificar se o item foi criado
SELECT 
    'ITEM CRIADO' as status,
    nome,
    quantidade_atual,
    id
FROM itens_aprovisionamento_2026_01_06 
WHERE nome = 'TESTE DEVOLUÇÃO - Caneca Azul';

-- 3. Verificar estrutura da tabela de atribuições (para usar campos corretos)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'atribuicoes_itens_2026_01_07_00_52'
AND column_name IN ('entidade_nome', 'nome_entidade', 'entidade', 'voluntario_nome', 'nome');

-- 4. Mostrar dados existentes para usar como exemplo
SELECT 
    'ATRIBUIÇÕES EXISTENTES' as info,
    COUNT(*) as total
FROM atribuicoes_itens_2026_01_07_00_52;

-- 5. Se existirem atribuições, mostrar uma para ver a estrutura
DO $$
DECLARE
    v_sample_record RECORD;
BEGIN
    -- Buscar uma atribuição existente para ver a estrutura
    SELECT * INTO v_sample_record
    FROM atribuicoes_itens_2026_01_07_00_52
    LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE 'ESTRUTURA ENCONTRADA - Exemplo de atribuição existente:';
        RAISE NOTICE 'ID: %', v_sample_record.id;
        RAISE NOTICE 'Item ID: %', v_sample_record.item_id;
        RAISE NOTICE 'Tipo: %', v_sample_record.tipo_atribuicao;
        RAISE NOTICE 'Estado: %', v_sample_record.estado;
        RAISE NOTICE 'Quantidade: %', v_sample_record.quantidade_atribuida;
    ELSE
        RAISE NOTICE 'Nenhuma atribuição existente encontrada';
    END IF;
END;
$$;