-- Criar sistema financeiro básico funcional
-- Data: 2025-11-29 03:15

-- 1. Verificar se tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('movimentos_financeiros', 'categorias_financeiras');

-- 2. Criar tabela movimentos_financeiros se não existir
CREATE TABLE IF NOT EXISTS movimentos_financeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_movimento TEXT UNIQUE NOT NULL DEFAULT ('MOV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD(EXTRACT(HOUR FROM NOW())::TEXT, 2, '0') || LPAD(EXTRACT(MINUTE FROM NOW())::TEXT, 2, '0')),
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

-- 3. Inserir dados de teste para movimentos financeiros
INSERT INTO movimentos_financeiros (tipo_movimento, escopo, descricao, valor, data_movimento, status)
VALUES 
    ('receita', 'associacao', 'Doação mensal', 500.00, CURRENT_DATE - 5, 'confirmado'),
    ('receita', 'associacao', 'Venda de produtos', 150.00, CURRENT_DATE - 3, 'confirmado'),
    ('despesa', 'associacao', 'Ração para animais', 200.00, CURRENT_DATE - 2, 'confirmado'),
    ('despesa', 'associacao', 'Medicamentos', 80.00, CURRENT_DATE - 1, 'confirmado'),
    ('receita', 'associacao', 'Doação pontual', 300.00, CURRENT_DATE, 'confirmado')
ON CONFLICT (numero_movimento) DO NOTHING;

-- 4. Criar views para resumos financeiros
CREATE OR REPLACE VIEW vw_resumo_financeiro_associacao AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' THEN valor ELSE -valor END), 0) as saldo
FROM movimentos_financeiros 
WHERE escopo = 'associacao' AND status = 'confirmado';

-- 5. Criar função para resumo de animais
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

-- 6. Desabilitar RLS para as tabelas
ALTER TABLE movimentos_financeiros DISABLE ROW LEVEL SECURITY;

-- 7. Testar as views e funções
SELECT * FROM vw_resumo_financeiro_associacao;
SELECT * FROM get_resumo_animais_total();

-- 8. Verificar dados inseridos
SELECT 
    tipo_movimento,
    escopo,
    COUNT(*) as quantidade,
    SUM(valor) as total_valor
FROM movimentos_financeiros 
GROUP BY tipo_movimento, escopo
ORDER BY tipo_movimento, escopo;