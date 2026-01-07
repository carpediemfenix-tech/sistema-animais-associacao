-- Verificar estrutura da tabela de atribuições
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'atribuicoes_itens_2026_01_07_00_52'
ORDER BY ordinal_position;

-- Criar dados de teste com estrutura correta
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
    50, -- Stock inicial de 50 unidades
    10, -- Stock mínimo
    5.99, -- Preço unitário
    (SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome ILIKE '%caneca%' OR nome ILIKE '%utensílio%' OR nome ILIKE '%material%' LIMIT 1),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026'
);

-- Verificar se o item foi criado
SELECT id, nome, quantidade_atual FROM itens_aprovisionamento_2026_01_06 WHERE nome = 'Caneca 2026';