-- ========================================
-- FUNÇÕES FINANCEIRAS SIMPLES E FUNCIONAIS
-- ========================================

-- Função para obter estatísticas gerais básicas
CREATE OR REPLACE FUNCTION get_estatisticas_gerais()
RETURNS TABLE (
    total_animais BIGINT,
    total_intervencoes BIGINT,
    total_eventos BIGINT,
    total_localizacoes BIGINT,
    total_responsabilidades BIGINT,
    total_voluntarios BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM animais)::BIGINT,
        (SELECT COUNT(*) FROM intervencoes)::BIGINT,
        (SELECT COUNT(*) FROM eventos_animal)::BIGINT,
        (SELECT COUNT(*) FROM localizacoes_animal)::BIGINT,
        (SELECT COUNT(*) FROM responsabilidades_animal)::BIGINT,
        (SELECT COUNT(*) FROM voluntarios)::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Função para obter custos de intervenções por animal
CREATE OR REPLACE FUNCTION get_custos_intervencoes_por_animal()
RETURNS TABLE (
    animal_id UUID,
    nome TEXT,
    especie TEXT,
    total_intervencoes BIGINT,
    custo_total DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.nome,
        a.especie,
        COUNT(i.id)::BIGINT as total_intervencoes,
        COALESCE(SUM(i.custo_final), 0) as custo_total
    FROM animais a
    LEFT JOIN intervencoes i ON a.id = i.animal_id
    GROUP BY a.id, a.nome, a.especie
    ORDER BY custo_total DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter resumo de custos por tipo de localização
CREATE OR REPLACE FUNCTION get_custos_por_localizacao()
RETURNS TABLE (
    tipo_localizacao TEXT,
    custo_diario DECIMAL(10,2),
    total_utilizacoes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.tipo_localizacao,
        cl.custo_diario,
        COUNT(la.id)::BIGINT as total_utilizacoes
    FROM custos_localizacoes cl
    LEFT JOIN localizacoes_animal la ON cl.tipo_localizacao = la.tipo_localizacao
    GROUP BY cl.tipo_localizacao, cl.custo_diario
    ORDER BY cl.custo_diario DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter resumo de subsídios por tipo de responsabilidade
CREATE OR REPLACE FUNCTION get_subsidios_por_responsabilidade()
RETURNS TABLE (
    tipo_responsabilidade TEXT,
    subsidio_mensal DECIMAL(10,2),
    total_responsabilidades BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.tipo_responsabilidade,
        sr.subsidio_mensal,
        COUNT(ra.id)::BIGINT as total_responsabilidades
    FROM subsidios_responsabilidades sr
    LEFT JOIN responsabilidades_animal ra ON sr.tipo_responsabilidade = ra.tipo_responsabilidade
    GROUP BY sr.tipo_responsabilidade, sr.subsidio_mensal
    ORDER BY sr.subsidio_mensal DESC;
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

SELECT 'Teste função custos por localização:' as teste;
SELECT * FROM get_custos_por_localizacao() LIMIT 3;

SELECT 'Teste função subsídios por responsabilidade:' as teste;
SELECT * FROM get_subsidios_por_responsabilidade() LIMIT 3;