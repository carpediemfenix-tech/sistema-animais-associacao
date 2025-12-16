-- Dashboard Executivo Avançado
-- Criado em: 2025-12-16 05:00 UTC

-- View para KPIs executivos em tempo real
CREATE OR REPLACE VIEW public.kpis_executivos_2025_12_16_05_00 AS
WITH estatisticas_base AS (
    SELECT 
        -- Animais
        COUNT(*) FILTER (WHERE a.ativo = true) as total_animais,
        COUNT(*) FILTER (WHERE a.ativo = true AND a.estado = 'disponivel') as animais_disponiveis,
        COUNT(*) FILTER (WHERE a.ativo = true AND a.estado = 'adotado') as animais_adotados,
        COUNT(*) FILTER (WHERE a.ativo = true AND a.estado = 'critico') as animais_criticos,
        
        -- Voluntários
        (SELECT COUNT(*) FROM public.voluntarios WHERE ativo = true) as total_voluntarios,
        (SELECT COUNT(*) FROM public.voluntarios WHERE ativo = true AND ultima_atividade > NOW() - INTERVAL '30 days') as voluntarios_ativos,
        
        -- Equipamentos
        (SELECT COUNT(*) FROM public.equipamentos_2025_12_13_01_00 WHERE ativo = true) as total_equipamentos,
        (SELECT COUNT(*) FROM public.equipamentos_2025_12_13_01_00 WHERE ativo = true AND estado = 'disponivel') as equipamentos_disponiveis,
        (SELECT COUNT(*) FROM public.equipamentos_2025_12_13_01_00 WHERE ativo = true AND estado = 'manutencao') as equipamentos_manutencao,
        
        -- Financeiro
        (SELECT COALESCE(SUM(valor), 0) FROM public.movimentos_financeiros WHERE tipo = 'receita' AND data_movimento >= DATE_TRUNC('month', CURRENT_DATE)) as receitas_mes,
        (SELECT COALESCE(SUM(valor), 0) FROM public.movimentos_financeiros WHERE tipo = 'despesa' AND data_movimento >= DATE_TRUNC('month', CURRENT_DATE)) as despesas_mes,
        
        -- Intervenções
        (SELECT COUNT(*) FROM public.intervencoes WHERE data_intervencao >= DATE_TRUNC('month', CURRENT_DATE)) as intervencoes_mes,
        (SELECT COUNT(*) FROM public.intervencoes WHERE status = 'agendada' AND data_intervencao > NOW()) as intervencoes_agendadas
        
    FROM public.animais a
    WHERE a.created_at IS NOT NULL
),
tendencias AS (
    SELECT 
        -- Tendência de adoções (últimos 30 dias vs 30 dias anteriores)
        COUNT(*) FILTER (WHERE a.data_adocao >= CURRENT_DATE - INTERVAL '30 days') as adocoes_ultimos_30,
        COUNT(*) FILTER (WHERE a.data_adocao >= CURRENT_DATE - INTERVAL '60 days' AND a.data_adocao < CURRENT_DATE - INTERVAL '30 days') as adocoes_30_anteriores,
        
        -- Tendência de novos animais
        COUNT(*) FILTER (WHERE a.created_at >= CURRENT_DATE - INTERVAL '30 days') as novos_animais_30,
        COUNT(*) FILTER (WHERE a.created_at >= CURRENT_DATE - INTERVAL '60 days' AND a.created_at < CURRENT_DATE - INTERVAL '30 days') as novos_animais_30_anteriores
        
    FROM public.animais a
)
SELECT 
    -- KPIs Principais
    eb.total_animais,
    eb.animais_disponiveis,
    eb.animais_adotados,
    eb.animais_criticos,
    eb.total_voluntarios,
    eb.voluntarios_ativos,
    eb.total_equipamentos,
    eb.equipamentos_disponiveis,
    eb.equipamentos_manutencao,
    eb.receitas_mes,
    eb.despesas_mes,
    eb.receitas_mes - eb.despesas_mes as saldo_mes,
    eb.intervencoes_mes,
    eb.intervencoes_agendadas,
    
    -- Taxas e Percentuais
    CASE 
        WHEN eb.total_animais > 0 THEN ROUND((eb.animais_adotados::DECIMAL / eb.total_animais) * 100, 2)
        ELSE 0 
    END as taxa_adocao_percent,
    
    CASE 
        WHEN eb.total_voluntarios > 0 THEN ROUND((eb.voluntarios_ativos::DECIMAL / eb.total_voluntarios) * 100, 2)
        ELSE 0 
    END as taxa_voluntarios_ativos_percent,
    
    CASE 
        WHEN eb.total_equipamentos > 0 THEN ROUND((eb.equipamentos_disponiveis::DECIMAL / eb.total_equipamentos) * 100, 2)
        ELSE 0 
    END as taxa_equipamentos_disponiveis_percent,
    
    -- Tendências
    t.adocoes_ultimos_30,
    t.adocoes_30_anteriores,
    CASE 
        WHEN t.adocoes_30_anteriores > 0 THEN ROUND(((t.adocoes_ultimos_30 - t.adocoes_30_anteriores)::DECIMAL / t.adocoes_30_anteriores) * 100, 2)
        ELSE 0 
    END as tendencia_adocoes_percent,
    
    t.novos_animais_30,
    t.novos_animais_30_anteriores,
    CASE 
        WHEN t.novos_animais_30_anteriores > 0 THEN ROUND(((t.novos_animais_30 - t.novos_animais_30_anteriores)::DECIMAL / t.novos_animais_30_anteriores) * 100, 2)
        ELSE 0 
    END as tendencia_novos_animais_percent,
    
    -- Alertas e Status
    CASE 
        WHEN eb.animais_criticos > 0 THEN 'critico'
        WHEN eb.equipamentos_manutencao > (eb.total_equipamentos * 0.2) THEN 'atencao'
        WHEN eb.receitas_mes < eb.despesas_mes THEN 'atencao'
        ELSE 'normal'
    END as status_geral,
    
    -- Timestamp da última atualização
    NOW() as ultima_atualizacao
    
FROM estatisticas_base eb
CROSS JOIN tendencias t;

-- View para análise de performance por período
CREATE OR REPLACE VIEW public.performance_mensal_2025_12_16_05_00 AS
WITH meses AS (
    SELECT 
        DATE_TRUNC('month', generate_series(
            CURRENT_DATE - INTERVAL '12 months',
            CURRENT_DATE,
            INTERVAL '1 month'
        )) as mes
),
dados_mensais AS (
    SELECT 
        m.mes,
        
        -- Animais
        COUNT(a.id) FILTER (WHERE DATE_TRUNC('month', a.created_at) = m.mes) as novos_animais,
        COUNT(a.id) FILTER (WHERE DATE_TRUNC('month', a.data_adocao) = m.mes) as adocoes,
        
        -- Intervenções
        COUNT(i.id) FILTER (WHERE DATE_TRUNC('month', i.data_intervencao) = m.mes) as intervencoes,
        COALESCE(AVG(i.custo) FILTER (WHERE DATE_TRUNC('month', i.data_intervencao) = m.mes), 0) as custo_medio_intervencao,
        
        -- Financeiro
        COALESCE(SUM(mf.valor) FILTER (WHERE DATE_TRUNC('month', mf.data_movimento) = m.mes AND mf.tipo = 'receita'), 0) as receitas,
        COALESCE(SUM(mf.valor) FILTER (WHERE DATE_TRUNC('month', mf.data_movimento) = m.mes AND mf.tipo = 'despesa'), 0) as despesas,
        
        -- Voluntários
        COUNT(DISTINCT v.id) FILTER (WHERE DATE_TRUNC('month', v.created_at) = m.mes) as novos_voluntarios
        
    FROM meses m
    LEFT JOIN public.animais a ON DATE_TRUNC('month', a.created_at) = m.mes OR DATE_TRUNC('month', a.data_adocao) = m.mes
    LEFT JOIN public.intervencoes i ON DATE_TRUNC('month', i.data_intervencao) = m.mes
    LEFT JOIN public.movimentos_financeiros mf ON DATE_TRUNC('month', mf.data_movimento) = m.mes
    LEFT JOIN public.voluntarios v ON DATE_TRUNC('month', v.created_at) = m.mes
    GROUP BY m.mes
)
SELECT 
    mes,
    novos_animais,
    adocoes,
    intervencoes,
    custo_medio_intervencao,
    receitas,
    despesas,
    receitas - despesas as saldo_mensal,
    novos_voluntarios,
    
    -- Cálculos de eficiência
    CASE 
        WHEN novos_animais > 0 THEN ROUND((adocoes::DECIMAL / novos_animais) * 100, 2)
        ELSE 0 
    END as taxa_adocao_mensal,
    
    -- Comparação com mês anterior
    LAG(adocoes) OVER (ORDER BY mes) as adocoes_mes_anterior,
    LAG(receitas) OVER (ORDER BY mes) as receitas_mes_anterior,
    
    CASE 
        WHEN LAG(adocoes) OVER (ORDER BY mes) > 0 THEN 
            ROUND(((adocoes - LAG(adocoes) OVER (ORDER BY mes))::DECIMAL / LAG(adocoes) OVER (ORDER BY mes)) * 100, 2)
        ELSE 0 
    END as crescimento_adocoes_percent,
    
    CASE 
        WHEN LAG(receitas) OVER (ORDER BY mes) > 0 THEN 
            ROUND(((receitas - LAG(receitas) OVER (ORDER BY mes))::DECIMAL / LAG(receitas) OVER (ORDER BY mes)) * 100, 2)
        ELSE 0 
    END as crescimento_receitas_percent
    
FROM dados_mensais
ORDER BY mes DESC;

-- View para alertas e notificações críticas
CREATE OR REPLACE VIEW public.alertas_criticos_2025_12_16_05_00 AS
SELECT 
    'animal_critico' as tipo_alerta,
    'Animais em Estado Crítico' as titulo,
    COUNT(*) as quantidade,
    'critica' as prioridade,
    'Há ' || COUNT(*) || ' animais que requerem atenção médica imediata' as descricao,
    jsonb_agg(jsonb_build_object('id', id, 'nome', nome, 'estado', estado)) as detalhes
FROM public.animais 
WHERE estado = 'critico' AND ativo = true
HAVING COUNT(*) > 0

UNION ALL

SELECT 
    'equipamento_manutencao' as tipo_alerta,
    'Equipamentos em Manutenção' as titulo,
    COUNT(*) as quantidade,
    CASE WHEN COUNT(*) > 10 THEN 'alta' ELSE 'media' END as prioridade,
    'Há ' || COUNT(*) || ' equipamentos em manutenção' as descricao,
    jsonb_agg(jsonb_build_object('id', id, 'codigo', codigo_interno, 'estado', estado)) as detalhes
FROM public.equipamentos_2025_12_13_01_00 
WHERE estado = 'manutencao' AND ativo = true
HAVING COUNT(*) > 0

UNION ALL

SELECT 
    'saldo_negativo' as tipo_alerta,
    'Saldo Financeiro Negativo' as titulo,
    1 as quantidade,
    'critica' as prioridade,
    'O saldo atual está negativo: ' || TO_CHAR(saldo, 'L999G999D99') as descricao,
    jsonb_build_object('saldo_atual', saldo, 'data_calculo', NOW()) as detalhes
FROM (
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM public.movimentos_financeiros
) s
WHERE s.saldo < 0

UNION ALL

SELECT 
    'intervencoes_atrasadas' as tipo_alerta,
    'Intervenções Atrasadas' as titulo,
    COUNT(*) as quantidade,
    'alta' as prioridade,
    'Há ' || COUNT(*) || ' intervenções agendadas que estão atrasadas' as descricao,
    jsonb_agg(jsonb_build_object('id', id, 'animal_id', animal_id, 'data_agendada', data_intervencao)) as detalhes
FROM public.intervencoes 
WHERE status = 'agendada' AND data_intervencao < NOW()
HAVING COUNT(*) > 0;

-- Função para calcular KPIs personalizados
CREATE OR REPLACE FUNCTION calcular_kpis_personalizados(
    p_data_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_data_fim DATE DEFAULT CURRENT_DATE,
    p_categoria VARCHAR DEFAULT 'geral'
) RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    CASE p_categoria
        WHEN 'animais' THEN
            SELECT jsonb_build_object(
                'total_periodo', COUNT(*),
                'adocoes_periodo', COUNT(*) FILTER (WHERE data_adocao BETWEEN p_data_inicio AND p_data_fim),
                'novos_animais', COUNT(*) FILTER (WHERE created_at::DATE BETWEEN p_data_inicio AND p_data_fim),
                'taxa_adocao', CASE WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE data_adocao BETWEEN p_data_inicio AND p_data_fim)::DECIMAL / COUNT(*)) * 100, 2) ELSE 0 END,
                'especies_distribuicao', jsonb_object_agg(especie, count_especie)
            ) INTO v_resultado
            FROM (
                SELECT 
                    a.*,
                    e.nome as especie,
                    COUNT(*) OVER (PARTITION BY a.especie_id) as count_especie
                FROM public.animais a
                LEFT JOIN public.especies e ON a.especie_id = e.id
                WHERE a.ativo = true
            ) dados;
            
        WHEN 'financeiro' THEN
            SELECT jsonb_build_object(
                'receitas_periodo', COALESCE(SUM(valor) FILTER (WHERE tipo = 'receita'), 0),
                'despesas_periodo', COALESCE(SUM(valor) FILTER (WHERE tipo = 'despesa'), 0),
                'saldo_periodo', COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0),
                'transacoes_total', COUNT(*),
                'ticket_medio', COALESCE(AVG(valor), 0),
                'categorias_despesas', jsonb_object_agg(categoria, total_categoria)
            ) INTO v_resultado
            FROM (
                SELECT 
                    mf.*,
                    SUM(valor) OVER (PARTITION BY categoria) as total_categoria
                FROM public.movimentos_financeiros mf
                WHERE data_movimento BETWEEN p_data_inicio AND p_data_fim
            ) dados;
            
        ELSE -- 'geral'
            SELECT jsonb_build_object(
                'resumo_geral', jsonb_build_object(
                    'animais_ativos', (SELECT COUNT(*) FROM public.animais WHERE ativo = true),
                    'voluntarios_ativos', (SELECT COUNT(*) FROM public.voluntarios WHERE ativo = true),
                    'equipamentos_funcionais', (SELECT COUNT(*) FROM public.equipamentos_2025_12_13_01_00 WHERE ativo = true AND estado != 'danificado'),
                    'saldo_atual', (SELECT COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) FROM public.movimentos_financeiros)
                ),
                'periodo_analise', jsonb_build_object(
                    'data_inicio', p_data_inicio,
                    'data_fim', p_data_fim,
                    'dias_periodo', p_data_fim - p_data_inicio
                )
            ) INTO v_resultado;
    END CASE;
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance das views
CREATE INDEX IF NOT EXISTS idx_animais_estado_ativo ON public.animais(estado, ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_animais_data_adocao ON public.animais(data_adocao) WHERE data_adocao IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intervencoes_data_status ON public.intervencoes(data_intervencao, status);
CREATE INDEX IF NOT EXISTS idx_movimentos_data_tipo ON public.movimentos_financeiros(data_movimento, tipo);

-- RLS para as views (herdam das tabelas base)
-- As views automaticamente respeitam as políticas RLS das tabelas subjacentes