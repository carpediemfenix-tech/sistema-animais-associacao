-- ========================================
-- FUNÇÕES SQL CORRIGIDAS PARA CÁLCULOS FINANCEIROS
-- ========================================

-- Função para calcular custo total de um animal (versão simplificada)
CREATE OR REPLACE FUNCTION calcular_custo_total_animal(animal_uuid UUID)
RETURNS TABLE (
    custo_intervencoes DECIMAL(10,2),
    custo_localizacoes DECIMAL(10,2),
    custo_responsabilidades DECIMAL(10,2),
    custo_total DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH custos_intervencoes AS (
        SELECT COALESCE(SUM(custo_final), 0) as total_intervencoes
        FROM intervencoes 
        WHERE animal_id = animal_uuid
    ),
    custos_localizacoes AS (
        SELECT COALESCE(SUM(
            CASE 
                WHEN la.data_fim IS NOT NULL THEN 
                    (la.data_fim - la.data_inicio) * cl.custo_diario
                ELSE 
                    (CURRENT_DATE - la.data_inicio) * cl.custo_diario
            END
        ), 0) as total_localizacoes
        FROM localizacoes_animal la
        LEFT JOIN custos_localizacoes cl ON la.tipo_localizacao = cl.tipo_localizacao
        WHERE la.animal_id = animal_uuid
    ),
    custos_responsabilidades AS (
        SELECT COALESCE(SUM(sr.subsidio_mensal), 0) as total_responsabilidades
        FROM responsabilidades_animal ra
        LEFT JOIN subsidios_responsabilidades sr ON ra.tipo_responsabilidade = sr.tipo_responsabilidade
        WHERE ra.animal_id = animal_uuid AND ra.ativa = true
    )
    SELECT 
        ci.total_intervencoes,
        cl.total_localizacoes,
        cr.total_responsabilidades,
        (ci.total_intervencoes + cl.total_localizacoes + cr.total_responsabilidades) as total
    FROM custos_intervencoes ci, custos_localizacoes cl, custos_responsabilidades cr;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular custos por categoria (versão simplificada)
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
    SELECT 'Localizações'::TEXT, COALESCE(SUM(cl.custo_diario), 0), COUNT(*)
    FROM localizacoes_animal la
    LEFT JOIN custos_localizacoes cl ON la.tipo_localizacao = cl.tipo_localizacao
    UNION ALL
    SELECT 'Responsabilidades'::TEXT, COALESCE(SUM(sr.subsidio_mensal), 0), COUNT(*)
    FROM responsabilidades_animal ra
    LEFT JOIN subsidios_responsabilidades sr ON ra.tipo_responsabilidade = sr.tipo_responsabilidade
    WHERE ra.ativa = true;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas gerais da associação
CREATE OR REPLACE FUNCTION get_estatisticas_gerais()
RETURNS TABLE (
    total_animais BIGINT,
    animais_ativos BIGINT,
    total_intervencoes BIGINT,
    total_eventos BIGINT,
    total_localizacoes BIGINT,
    total_responsabilidades BIGINT,
    total_voluntarios BIGINT,
    custo_total_estimado DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM animais)::BIGINT,
        (SELECT COUNT(*) FROM animais WHERE ativo = true)::BIGINT,
        (SELECT COUNT(*) FROM intervencoes)::BIGINT,
        (SELECT COUNT(*) FROM eventos_animal)::BIGINT,
        (SELECT COUNT(*) FROM localizacoes_animal)::BIGINT,
        (SELECT COUNT(*) FROM responsabilidades_animal WHERE ativa = true)::BIGINT,
        (SELECT COUNT(*) FROM voluntarios WHERE ativo = true)::BIGINT,
        (SELECT COALESCE(SUM(custo_final), 0) FROM intervencoes)::DECIMAL(10,2);
END;
$$ LANGUAGE plpgsql;

-- Função para obter top 5 animais com maiores custos de intervenções
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
    ORDER BY custo_total DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Função para obter custos por mês (últimos 6 meses)
CREATE OR REPLACE FUNCTION get_custos_por_mes()
RETURNS TABLE (
    mes TEXT,
    custo_intervencoes DECIMAL(10,2),
    custo_movimentos DECIMAL(10,2),
    custo_total DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH meses AS (
        SELECT 
            TO_CHAR(CURRENT_DATE - INTERVAL '1 month' * generate_series(0, 5), 'YYYY-MM') as mes
    ),
    custos_intervencoes_mes AS (
        SELECT 
            TO_CHAR(data_intervencao, 'YYYY-MM') as mes,
            SUM(custo_final) as total_intervencoes
        FROM intervencoes
        WHERE data_intervencao >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(data_intervencao, 'YYYY-MM')
    ),
    custos_movimentos_mes AS (
        SELECT 
            TO_CHAR(data, 'YYYY-MM') as mes,
            SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_movimentos
        FROM movimentos_financeiros
        WHERE data >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(data, 'YYYY-MM')
    )
    SELECT 
        m.mes,
        COALESCE(ci.total_intervencoes, 0),
        COALESCE(cm.total_movimentos, 0),
        COALESCE(ci.total_intervencoes, 0) + COALESCE(cm.total_movimentos, 0)
    FROM meses m
    LEFT JOIN custos_intervencoes_mes ci ON m.mes = ci.mes
    LEFT JOIN custos_movimentos_mes cm ON m.mes = cm.mes
    ORDER BY m.mes DESC;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular custo_final automaticamente
CREATE OR REPLACE FUNCTION calcular_custo_final_intervencao()
RETURNS TRIGGER AS $$
BEGIN
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_intervencoes_custo ON intervencoes(custo_final);
CREATE INDEX IF NOT EXISTS idx_intervencoes_data_custo ON intervencoes(data_intervencao, custo_final);
CREATE INDEX IF NOT EXISTS idx_custos_localizacoes_tipo ON custos_localizacoes(tipo_localizacao);
CREATE INDEX IF NOT EXISTS idx_subsidios_responsabilidades_tipo ON subsidios_responsabilidades(tipo_responsabilidade);

-- Testar as funções criadas
SELECT 'Teste função custos por categoria:' as teste;
SELECT * FROM get_custos_por_categoria();

SELECT 'Teste função estatísticas gerais:' as teste;
SELECT * FROM get_estatisticas_gerais();