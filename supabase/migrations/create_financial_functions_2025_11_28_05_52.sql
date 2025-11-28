-- 💰 EKO: FUNÇÃO PARA RESUMO FINANCEIRO TOTAL DOS ANIMAIS
-- Data: 2025-11-28 05:52 UTC

-- Função para calcular resumo financeiro total de todos os animais
CREATE OR REPLACE FUNCTION get_resumo_animais_total()
RETURNS TABLE (
    total_receitas DECIMAL(10,2),
    total_despesas DECIMAL(10,2),
    saldo DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM public.movimentos_financeiros_2025_11_28_05_52
    WHERE escopo = 'animal';
END;
$$ LANGUAGE plpgsql;

-- Função para calcular resumo financeiro por animal específico
CREATE OR REPLACE FUNCTION get_resumo_animal(animal_uuid UUID)
RETURNS TABLE (
    total_receitas DECIMAL(10,2),
    total_despesas DECIMAL(10,2),
    saldo DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM public.movimentos_financeiros_2025_11_28_05_52
    WHERE animal_id = animal_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para obter movimentos financeiros de um animal
CREATE OR REPLACE FUNCTION get_movimentos_animal(animal_uuid UUID)
RETURNS TABLE (
    id UUID,
    numero_movimento VARCHAR(20),
    tipo_movimento VARCHAR(20),
    categoria_nome VARCHAR(100),
    categoria_cor VARCHAR(7),
    categoria_icone VARCHAR(50),
    descricao TEXT,
    valor DECIMAL(10,2),
    data_movimento DATE,
    status VARCHAR(20),
    metodo_pagamento VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.numero_movimento,
        m.tipo_movimento,
        c.nome as categoria_nome,
        c.cor as categoria_cor,
        c.icone as categoria_icone,
        m.descricao,
        m.valor,
        m.data_movimento,
        m.status,
        m.metodo_pagamento,
        m.observacoes,
        m.created_at
    FROM public.movimentos_financeiros_2025_11_28_05_52 m
    LEFT JOIN public.categorias_financeiras_2025_11_28_05_52 c ON m.categoria_id = c.id
    WHERE m.animal_id = animal_uuid
    ORDER BY m.data_movimento DESC, m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas financeiras por categoria
CREATE OR REPLACE FUNCTION get_estatisticas_por_categoria()
RETURNS TABLE (
    categoria_nome VARCHAR(100),
    categoria_cor VARCHAR(7),
    escopo VARCHAR(20),
    tipo VARCHAR(20),
    total_movimentos BIGINT,
    valor_total DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.nome as categoria_nome,
        c.cor as categoria_cor,
        c.escopo,
        c.tipo,
        COUNT(m.id) as total_movimentos,
        COALESCE(SUM(m.valor), 0) as valor_total
    FROM public.categorias_financeiras_2025_11_28_05_52 c
    LEFT JOIN public.movimentos_financeiros_2025_11_28_05_52 m ON c.id = m.categoria_id
    WHERE c.ativo = true
    GROUP BY c.id, c.nome, c.cor, c.escopo, c.tipo, c.ordem
    ORDER BY c.ordem, c.nome;
END;
$$ LANGUAGE plpgsql;

-- ✅ FUNÇÕES SQL CRIADAS COM SUCESSO!