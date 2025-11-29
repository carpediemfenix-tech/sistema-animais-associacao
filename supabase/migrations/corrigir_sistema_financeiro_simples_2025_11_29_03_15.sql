-- Corrigir sistema financeiro com numero_movimento simples
-- Data: 2025-11-29 03:15

-- 1. Verificar se tabela existe e limpar se necessário
DROP TABLE IF EXISTS movimentos_financeiros CASCADE;

-- 2. Criar tabela movimentos_financeiros simples
CREATE TABLE movimentos_financeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_movimento TEXT UNIQUE NOT NULL DEFAULT ('MOV-' || EXTRACT(EPOCH FROM NOW())::TEXT),
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('receita', 'despesa')),
    escopo TEXT NOT NULL CHECK (escopo IN ('animal', 'associacao')) DEFAULT 'associacao',
    categoria_id UUID REFERENCES categorias_financeiras(id),
    animal_id UUID REFERENCES animais(id),
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
    data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Desabilitar RLS
ALTER TABLE movimentos_financeiros DISABLE ROW LEVEL SECURITY;

-- 4. Inserir dados de teste simples
INSERT INTO movimentos_financeiros (numero_movimento, tipo_movimento, escopo, descricao, valor, data_movimento, status)
VALUES 
    ('MOV-001', 'receita', 'associacao', 'Doação mensal', 500.00, CURRENT_DATE - 5, 'confirmado'),
    ('MOV-002', 'receita', 'associacao', 'Venda de produtos', 150.00, CURRENT_DATE - 3, 'confirmado'),
    ('MOV-003', 'despesa', 'associacao', 'Ração para animais', 200.00, CURRENT_DATE - 2, 'confirmado'),
    ('MOV-004', 'despesa', 'associacao', 'Medicamentos', 80.00, CURRENT_DATE - 1, 'confirmado'),
    ('MOV-005', 'receita', 'associacao', 'Doação pontual', 300.00, CURRENT_DATE, 'confirmado'),
    ('MOV-006', 'despesa', 'animal', 'Consulta veterinária', 45.00, CURRENT_DATE - 4, 'confirmado'),
    ('MOV-007', 'despesa', 'animal', 'Vacinas', 35.00, CURRENT_DATE - 2, 'confirmado');

-- 5. Criar view para resumo da associação
CREATE OR REPLACE VIEW vw_resumo_financeiro_associacao AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE -valor END), 0) as saldo
FROM movimentos_financeiros 
WHERE escopo = 'associacao' AND status = 'confirmado';

-- 6. Criar função para resumo de animais
CREATE OR REPLACE FUNCTION get_resumo_animais_total()
RETURNS TABLE (
    total_receitas NUMERIC,
    total_despesas NUMERIC,
    saldo NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM movimentos_financeiros 
    WHERE escopo = 'animal' AND status = 'confirmado';
END;
$$ LANGUAGE plpgsql;

-- 7. Testar as views e funções
SELECT 'Resumo Associação:' as tipo;
SELECT * FROM vw_resumo_financeiro_associacao;

SELECT 'Resumo Animais:' as tipo;
SELECT * FROM get_resumo_animais_total();

-- 8. Verificar dados inseridos
SELECT 
    'Dados inseridos:' as info,
    tipo_movimento,
    escopo,
    COUNT(*) as quantidade,
    SUM(valor) as total_valor
FROM movimentos_financeiros 
GROUP BY tipo_movimento, escopo
ORDER BY tipo_movimento, escopo;