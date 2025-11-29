-- Corrigir views financeiras e dados de teste
-- Data: 2025-11-29 03:30

-- 1. Verificar dados atuais
SELECT 'Dados atuais na tabela:' as info;
SELECT * FROM movimentos_financeiros ORDER BY created_at DESC;

-- 2. Recriar view da associação com valores padrão
DROP VIEW IF EXISTS vw_resumo_financeiro_associacao;
CREATE VIEW vw_resumo_financeiro_associacao AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' AND escopo = 'associacao' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' AND escopo = 'associacao' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' AND escopo = 'associacao' THEN valor 
                      WHEN tipo_movimento = 'despesa' AND escopo = 'associacao' THEN -valor 
                      ELSE 0 END), 0) as saldo
FROM movimentos_financeiros 
WHERE status = 'confirmado';

-- 3. Recriar função para animais
DROP FUNCTION IF EXISTS get_resumo_animais_total();
CREATE OR REPLACE FUNCTION get_resumo_animais_total()
RETURNS TABLE (
    total_receitas NUMERIC,
    total_despesas NUMERIC,
    saldo NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' AND escopo = 'animal' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'despesa' AND escopo = 'animal' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo_movimento = 'receita' AND escopo = 'animal' THEN valor 
                          WHEN tipo_movimento = 'despesa' AND escopo = 'animal' THEN -valor 
                          ELSE 0 END), 0) as saldo
    FROM movimentos_financeiros 
    WHERE status = 'confirmado';
END;
$$ LANGUAGE plpgsql;

-- 4. Testar as views
SELECT 'Resumo Associação (nova view):' as teste;
SELECT * FROM vw_resumo_financeiro_associacao;

SELECT 'Resumo Animais (nova função):' as teste;
SELECT * FROM get_resumo_animais_total();

-- 5. Verificar se há dados NULL problemáticos
SELECT 
    'Verificação de NULLs:' as info,
    COUNT(*) as total_registos,
    COUNT(valor) as registos_com_valor,
    SUM(CASE WHEN valor IS NULL THEN 1 ELSE 0 END) as valores_null
FROM movimentos_financeiros;

-- 6. Inserir mais dados de teste se necessário
INSERT INTO movimentos_financeiros (numero_movimento, tipo_movimento, escopo, descricao, valor, data_movimento, status)
VALUES 
    ('MOV-008', 'receita', 'animal', 'Taxa de adoção', 100.00, CURRENT_DATE - 1, 'confirmado'),
    ('MOV-009', 'despesa', 'associacao', 'Limpeza instalações', 50.00, CURRENT_DATE, 'confirmado')
ON CONFLICT (numero_movimento) DO NOTHING;

-- 7. Testar novamente após inserção
SELECT 'Após inserção adicional:' as teste;
SELECT * FROM vw_resumo_financeiro_associacao;
SELECT * FROM get_resumo_animais_total();