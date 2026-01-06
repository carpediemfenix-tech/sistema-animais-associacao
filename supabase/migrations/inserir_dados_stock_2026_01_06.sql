-- =====================================================
-- INSERIR DADOS DE EXEMPLO PARA SISTEMA DE STOCK
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS FORAM CRIADAS
SELECT 'TABELAS EXISTENTES' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%aprovisionamento_2026_01_06%'
ORDER BY table_name;

-- 2. INSERIR VARIAÇÕES PADRÃO (se não existirem)
INSERT INTO public.variacoes_aprovisionamento_2026_01_06 (categoria_id, tipo_variacao, valor, descricao, ordem_exibicao) 
SELECT categoria_id, tipo_variacao, valor, descricao, ordem_exibicao FROM (VALUES
-- Tamanhos para Fardamento e EPI
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'XS', 'Extra Pequeno', 1),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'S', 'Pequeno', 2),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'M', 'Médio', 3),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'L', 'Grande', 4),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'XL', 'Extra Grande', 5),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'TAMANHO', 'XXL', 'Extra Extra Grande', 6),

-- Especificações para Consumíveis Alimentares
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '1kg', 'Saco de 1 quilograma', 1),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '5kg', 'Saco de 5 quilogramas', 2),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '10kg', 'Saco de 10 quilogramas', 3),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'ESPECIFICACAO', '20kg', 'Saco de 20 quilogramas', 4),

-- Especificações para Medicação
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '100ml', 'Frasco de 100ml', 1),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '250ml', 'Frasco de 250ml', 2),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '500ml', 'Frasco de 500ml', 3),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '10 comp', 'Caixa com 10 comprimidos', 4),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'ESPECIFICACAO', '30 comp', 'Caixa com 30 comprimidos', 5)
) AS v(categoria_id, tipo_variacao, valor, descricao, ordem_exibicao)
WHERE NOT EXISTS (
    SELECT 1 FROM public.variacoes_aprovisionamento_2026_01_06 
    WHERE categoria_id = v.categoria_id AND tipo_variacao = v.tipo_variacao AND valor = v.valor
);

-- 3. INSERIR ITENS DE EXEMPLO (baseados nos seus exemplos)
INSERT INTO public.itens_aprovisionamento_2026_01_06 (
    tipo_id, nome, descricao, especificacao, quantidade_atual, stock_minimo, 
    preco_unitario, localizacao_fisica
) 
SELECT tipo_id, nome, descricao, especificacao, quantidade_atual, stock_minimo, preco_unitario, localizacao_fisica FROM (VALUES
-- Ração seca (exemplo do usuário)
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Ração Cão Adulto'), 
 'Ração Seca Cão Adulto 20kg', 'Ração seca premium para cães adultos', '20kg', 
 50, 5, 35.00, 'Armazém A - Prateleira 1'),

-- Blusões XXL (exemplo do usuário) - usando tipo Colete Refletor como base
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Colete Refletor'), 
 'Blusão Valentão ao Resgate XXL', 'Blusão oficial da associação tamanho XXL', 'XXL', 
 8, 2, 25.00, 'Armazém B - Armário Fardamento'),

-- Outros exemplos
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Antibiótico'), 
 'Amoxicilina 250ml', 'Antibiótico veterinário de largo espectro', '250ml', 
 12, 3, 15.50, 'Farmácia Veterinária - Frigorífico'),

((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Transportadora Grande'), 
 'Transportadora Plástico Grande', 'Transportadora resistente para cães grandes', 'Grande', 
 6, 2, 45.00, 'Armazém C - Zona Equipamentos'),

-- Mais exemplos para demonstrar variedade
((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Ração Gato Adulto'), 
 'Ração Seca Gato Adulto 10kg', 'Ração seca premium para gatos adultos', '10kg', 
 25, 3, 42.00, 'Armazém A - Prateleira 2'),

((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Luvas de Proteção'), 
 'Luvas Nitrilo M', 'Luvas de nitrilo descartáveis tamanho M', 'M', 
 200, 50, 0.15, 'Armazém B - Gaveta EPI'),

((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'Desinfetante'), 
 'Desinfetante Multiusos 1L', 'Desinfetante para limpeza geral', '1L', 
 15, 5, 3.50, 'Armazém D - Produtos Limpeza'),

((SELECT id FROM tipos_aprovisionamento_2026_01_06 WHERE nome = 'T-shirt Associação'), 
 'T-shirt Valentão L', 'T-shirt oficial da associação tamanho L', 'L', 
 30, 10, 12.00, 'Armazém B - Merchandising')
) AS i(tipo_id, nome, descricao, especificacao, quantidade_atual, stock_minimo, preco_unitario, localizacao_fisica)
WHERE NOT EXISTS (
    SELECT 1 FROM public.itens_aprovisionamento_2026_01_06 
    WHERE nome = i.nome
);

-- 4. VERIFICAR DADOS INSERIDOS
SELECT 'VARIAÇÕES INSERIDAS' as status, COUNT(*) as total FROM public.variacoes_aprovisionamento_2026_01_06;
SELECT 'ITENS INSERIDOS' as status, COUNT(*) as total FROM public.itens_aprovisionamento_2026_01_06;

-- 5. MOSTRAR RESUMO DOS ITENS CRIADOS
SELECT 
    c.nome as categoria,
    t.nome as tipo,
    i.nome as item,
    i.quantidade_atual,
    i.stock_minimo,
    i.alerta_stock_baixo,
    ROUND(i.valor_total_stock, 2) as valor_total,
    i.localizacao_fisica
FROM public.itens_aprovisionamento_2026_01_06 i
JOIN public.tipos_aprovisionamento_2026_01_06 t ON i.tipo_id = t.id
JOIN public.categorias_aprovisionamento_2026_01_06 c ON t.categoria_id = c.id
ORDER BY c.nome, t.nome, i.nome;

-- 6. MOSTRAR ALERTAS DE STOCK BAIXO
SELECT 
    'ALERTAS DE STOCK BAIXO' as status,
    COUNT(*) as total_alertas
FROM public.itens_aprovisionamento_2026_01_06 
WHERE alerta_stock_baixo = true;

SELECT 
    c.nome as categoria,
    t.nome as tipo,
    i.nome as item,
    i.quantidade_atual,
    i.stock_minimo,
    '⚠️ STOCK BAIXO' as alerta
FROM public.itens_aprovisionamento_2026_01_06 i
JOIN public.tipos_aprovisionamento_2026_01_06 t ON i.tipo_id = t.id
JOIN public.categorias_aprovisionamento_2026_01_06 c ON t.categoria_id = c.id
WHERE i.alerta_stock_baixo = true
ORDER BY c.nome, t.nome, i.nome;

-- 7. ESTATÍSTICAS GERAIS
SELECT 
    'ESTATÍSTICAS GERAIS' as titulo,
    (SELECT COUNT(*) FROM public.categorias_aprovisionamento_2026_01_06 WHERE ativo = true) as categorias_ativas,
    (SELECT COUNT(*) FROM public.tipos_aprovisionamento_2026_01_06 WHERE ativo = true) as tipos_ativos,
    (SELECT COUNT(*) FROM public.itens_aprovisionamento_2026_01_06 WHERE ativo = true) as itens_ativos,
    (SELECT COUNT(*) FROM public.itens_aprovisionamento_2026_01_06 WHERE alerta_stock_baixo = true) as alertas_stock,
    (SELECT ROUND(SUM(valor_total_stock), 2) FROM public.itens_aprovisionamento_2026_01_06 WHERE ativo = true) as valor_total_stock;