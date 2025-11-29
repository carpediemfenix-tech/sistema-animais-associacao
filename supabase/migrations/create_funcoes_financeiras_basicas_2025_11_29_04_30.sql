-- ========================================
-- FUNÇÕES FINANCEIRAS BÁSICAS E FUNCIONAIS
-- ========================================

-- Função simples para obter estatísticas gerais
CREATE OR REPLACE FUNCTION get_estatisticas_gerais()
RETURNS TABLE (
    total_animais BIGINT,
    total_intervencoes BIGINT,
    total_eventos BIGINT,
    total_localizacoes BIGINT,
    total_responsabilidades BIGINT,
    total_voluntarios BIGINT,
    custo_total_intervencoes DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM animais)::BIGINT,
        (SELECT COUNT(*) FROM intervencoes)::BIGINT,
        (SELECT COUNT(*) FROM eventos_animal)::BIGINT,
        (SELECT COUNT(*) FROM localizacoes_animal)::BIGINT,
        (SELECT COUNT(*) FROM responsabilidades_animal)::BIGINT,
        (SELECT COUNT(*) FROM voluntarios)::BIGINT,
        (SELECT COALESCE(SUM(custo_final), 0) FROM intervencoes)::DECIMAL(10,2);
END;
$$ LANGUAGE plpgsql;

-- Função para obter custos por categoria
CREATE OR REPLACE FUNCTION get_custos_por_categoria()
RETURNS TABLE (
    categoria TEXT,
    total_custos DECIMAL(10,2),
    numero_registos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Intervenções Médicas'::TEXT, COALESCE(SUM(custo_final), 0), COUNT(*)
    FROM intervencoes
    UNION ALL
    SELECT 'Movimentos Financeiros'::TEXT, COALESCE(SUM(valor), 0), COUNT(*)
    FROM movimentos_financeiros
    WHERE tipo = 'despesa';
END;
$$ LANGUAGE plpgsql;

-- Função para obter top animais com maiores custos
CREATE OR REPLACE FUNCTION get_top_animais_custos()
RETURNS TABLE (
    animal_id UUID,
    nome TEXT,
    especie TEXT,
    custo_intervencoes DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.nome,
        a.especie,
        COALESCE(SUM(i.custo_final), 0) as custo_total
    FROM animais a
    LEFT JOIN intervencoes i ON a.id = i.animal_id
    GROUP BY a.id, a.nome, a.especie
    HAVING SUM(i.custo_final) > 0
    ORDER BY custo_total DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular custo_final automaticamente
CREATE OR REPLACE FUNCTION calcular_custo_final_intervencao()
RETURNS TRIGGER AS $$
BEGIN
    -- Se custo não foi definido, usar 0
    IF NEW.custo IS NULL THEN
        NEW.custo = 0;
    END IF;
    
    -- Se desconto_protocolo não foi definido, usar 0
    IF NEW.desconto_protocolo IS NULL THEN
        NEW.desconto_protocolo = 0;
    END IF;
    
    -- Calcular custo final com desconto de protocolo
    NEW.custo_final = NEW.custo * (1 - (NEW.desconto_protocolo / 100));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para intervencoes
DROP TRIGGER IF EXISTS trigger_calcular_custo_final ON intervencoes;
CREATE TRIGGER trigger_calcular_custo_final
    BEFORE INSERT OR UPDATE ON intervencoes
    FOR EACH ROW
    EXECUTE FUNCTION calcular_custo_final_intervencao();

-- Testar as funções
SELECT 'Teste função estatísticas gerais:' as teste;
SELECT * FROM get_estatisticas_gerais();

SELECT 'Teste função custos por categoria:' as teste;
SELECT * FROM get_custos_por_categoria();

-- Verificar estrutura das tabelas criadas
SELECT 
    'Verificação tabelas financeiras:' as info,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_name IN ('custos_localizacoes', 'subsidios_responsabilidades');