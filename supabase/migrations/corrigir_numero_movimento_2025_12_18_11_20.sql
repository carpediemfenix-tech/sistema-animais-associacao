-- Corrigir problema do numero_movimento muito longo
-- Criada em: 2025-12-18 11:20 UTC

-- 1. Desabilitar RLS temporariamente
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 DISABLE ROW LEVEL SECURITY;

-- 2. Testar inserção com numero_movimento mais curto
INSERT INTO movimentos_financeiros_2025_12_13_06_00 (
    numero_movimento,
    data_movimento,
    tipo,
    escopo,
    valor,
    descricao,
    animal_id
) VALUES (
    'MOV-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(numero_movimento FROM 5) AS INTEGER)), 0) + 1 FROM movimentos_financeiros_2025_12_13_06_00 WHERE numero_movimento LIKE 'MOV-%')::text, 4, '0'),
    CURRENT_DATE,
    'despesa',
    'animal',
    50.00,
    'Teste inserção corrigida',
    '1685ea69-0598-4850-90c4-536c32323b35'
);

-- 3. Verificar se funcionou
SELECT * FROM movimentos_financeiros_2025_12_13_06_00 
WHERE descricao = 'Teste inserção corrigida';

-- 4. Contar total de movimentos
SELECT COUNT(*) as total_movimentos FROM movimentos_financeiros_2025_12_13_06_00;