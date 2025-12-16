-- ESTRUTURA CORRIGIDA PARA RELATÓRIOS E ANALYTICS

-- 1. Criar view para relatórios de utilização por voluntário
CREATE OR REPLACE VIEW relatorio_utilizacao_voluntarios AS
SELECT 
    v.id as voluntario_id,
    v.nome as voluntario_nome,
    v.email as voluntario_email,
    COUNT(DISTINCT a.id) as total_atribuicoes,
    COUNT(DISTINCT CASE WHEN a.estado = 'ativa' THEN a.id END) as atribuicoes_ativas,
    COUNT(DISTINCT CASE WHEN a.estado = 'devolvida' THEN a.id END) as atribuicoes_devolvidas,
    COUNT(DISTINCT CASE WHEN a.estado = 'perdida' THEN a.id END) as equipamentos_perdidos,
    COUNT(DISTINCT CASE WHEN a.estado = 'danificada' THEN a.id END) as equipamentos_danificados,
    AVG(CASE 
        WHEN a.data_devolucao IS NOT NULL AND a.data_devolucao_prevista IS NOT NULL 
        THEN (a.data_devolucao::date - a.data_devolucao_prevista::date)
        ELSE NULL 
    END) as media_dias_atraso,
    COUNT(DISTINCT e.id) as equipamentos_diferentes_utilizados,
    STRING_AGG(DISTINCT te.nome, ', ') as tipos_equipamentos_utilizados
FROM voluntarios v
LEFT JOIN atribuicoes_equipamentos_2025_12_13_01_00 a ON v.id = a.voluntario_id
LEFT JOIN equipamentos_2025_12_13_01_00 e ON a.equipamento_id = e.id
LEFT JOIN tipos_equipamentos_2025_12_13_01_00 te ON e.tipo_equipamento_id = te.id
WHERE v.ativo = true
GROUP BY v.id, v.nome, v.email;

-- 2. Criar view para relatórios financeiros de equipamentos
CREATE OR REPLACE VIEW relatorio_financeiro_equipamentos AS
SELECT 
    e.id as equipamento_id,
    e.codigo_interno,
    e.numero_serie,
    te.nome as tipo_equipamento,
    ce.nome as categoria,
    e.valor_aquisicao,
    e.data_aquisicao,
    e.garantia_ate,
    e.estado,
    COALESCE(SUM(m.custo), 0) as custo_total_manutencoes,
    COUNT(m.id) as total_manutencoes,
    COUNT(CASE WHEN m.status = 'concluida' THEN 1 END) as manutencoes_concluidas,
    COUNT(a.id) as total_atribuicoes,
    CASE 
        WHEN e.data_aquisicao IS NOT NULL 
        THEN (CURRENT_DATE - e.data_aquisicao::date) / 365.0
        ELSE 0 
    END as idade_anos,
    CASE 
        WHEN e.valor_aquisicao > 0 AND e.data_aquisicao IS NOT NULL
        THEN (e.valor_aquisicao + COALESCE(SUM(m.custo), 0)) / GREATEST((CURRENT_DATE - e.data_aquisicao::date) / 365.0, 0.1)
        ELSE 0 
    END as custo_anual_total
FROM equipamentos_2025_12_13_01_00 e
LEFT JOIN tipos_equipamentos_2025_12_13_01_00 te ON e.tipo_equipamento_id = te.id
LEFT JOIN categorias_equipamentos_2025_12_13_01_00 ce ON te.categoria_id = ce.id
LEFT JOIN manutencoes_equipamentos_2025_12_13_01_00 m ON e.id = m.equipamento_id
LEFT JOIN atribuicoes_equipamentos_2025_12_13_01_00 a ON e.id = a.equipamento_id
WHERE e.ativo = true
GROUP BY e.id, e.codigo_interno, e.numero_serie, te.nome, ce.nome, 
         e.valor_aquisicao, e.data_aquisicao, e.garantia_ate, e.estado;

-- 3. Criar view para métricas do dashboard
CREATE OR REPLACE VIEW dashboard_metricas_equipamentos AS
SELECT 
    -- Métricas gerais
    COUNT(*) as total_equipamentos,
    COUNT(CASE WHEN estado = 'disponivel' THEN 1 END) as equipamentos_disponiveis,
    COUNT(CASE WHEN estado = 'em_uso' THEN 1 END) as equipamentos_em_uso,
    COUNT(CASE WHEN estado = 'manutencao' THEN 1 END) as equipamentos_manutencao,
    COUNT(CASE WHEN estado = 'danificado' THEN 1 END) as equipamentos_danificados,
    
    -- Métricas financeiras
    SUM(valor_aquisicao) as valor_total_inventario,
    AVG(valor_aquisicao) as valor_medio_equipamento,
    
    -- Métricas de idade
    AVG(CASE 
        WHEN data_aquisicao IS NOT NULL 
        THEN (CURRENT_DATE - data_aquisicao::date) / 365.0
        ELSE NULL 
    END) as idade_media_anos,
    
    -- Métricas de garantia
    COUNT(CASE WHEN garantia_ate >= CURRENT_DATE THEN 1 END) as equipamentos_em_garantia,
    COUNT(CASE WHEN garantia_ate < CURRENT_DATE THEN 1 END) as equipamentos_fora_garantia,
    COUNT(CASE WHEN garantia_ate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days' THEN 1 END) as garantias_vencendo_90_dias
FROM equipamentos_2025_12_13_01_00
WHERE ativo = true;

-- 4. Criar view para análise de manutenções
CREATE OR REPLACE VIEW analise_manutencoes AS
SELECT 
    DATE_TRUNC('month', data_manutencao) as mes,
    COUNT(*) as total_manutencoes,
    COUNT(CASE WHEN tipo_manutencao = 'Preventiva' THEN 1 END) as manutencoes_preventivas,
    COUNT(CASE WHEN tipo_manutencao = 'Corretiva' THEN 1 END) as manutencoes_corretivas,
    COUNT(CASE WHEN tipo_manutencao = 'Preditiva' THEN 1 END) as manutencoes_preditivas,
    SUM(custo) as custo_total_mes,
    AVG(custo) as custo_medio_manutencao,
    COUNT(CASE WHEN status = 'concluida' THEN 1 END) as manutencoes_concluidas,
    COUNT(CASE WHEN status = 'agendada' THEN 1 END) as manutencoes_agendadas,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as manutencoes_em_andamento
FROM manutencoes_equipamentos_2025_12_13_01_00
WHERE data_manutencao >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', data_manutencao)
ORDER BY mes DESC;

-- 5. Criar view para análise de alertas
CREATE OR REPLACE VIEW analise_alertas AS
SELECT 
    tipo_alerta,
    prioridade,
    COUNT(*) as total_alertas,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as alertas_ativos,
    COUNT(CASE WHEN status = 'resolvido' THEN 1 END) as alertas_resolvidos,
    COUNT(CASE WHEN status = 'ignorado' THEN 1 END) as alertas_ignorados,
    AVG(CASE 
        WHEN data_resolucao IS NOT NULL 
        THEN (data_resolucao::date - data_criacao::date)
        ELSE NULL 
    END) as tempo_medio_resolucao_dias
FROM alertas_equipamentos_2025_12_16_07_00
GROUP BY tipo_alerta, prioridade
ORDER BY prioridade DESC, total_alertas DESC;

-- 6. Criar view para análise de atribuições
CREATE OR REPLACE VIEW analise_atribuicoes AS
SELECT 
    DATE_TRUNC('month', data_atribuicao) as mes,
    COUNT(*) as total_atribuicoes,
    COUNT(CASE WHEN estado = 'ativa' THEN 1 END) as atribuicoes_ativas,
    COUNT(CASE WHEN estado = 'devolvida' THEN 1 END) as atribuicoes_devolvidas,
    COUNT(CASE WHEN estado = 'perdida' THEN 1 END) as equipamentos_perdidos,
    COUNT(CASE WHEN estado = 'danificada' THEN 1 END) as equipamentos_danificados,
    AVG(CASE 
        WHEN data_devolucao IS NOT NULL 
        THEN (data_devolucao::date - data_atribuicao::date)
        ELSE NULL 
    END) as tempo_medio_uso_dias,
    COUNT(DISTINCT voluntario_id) as voluntarios_unicos,
    COUNT(DISTINCT equipamento_id) as equipamentos_unicos
FROM atribuicoes_equipamentos_2025_12_13_01_00
WHERE data_atribuicao >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', data_atribuicao)
ORDER BY mes DESC;

-- 7. Criar função para KPIs do dashboard
CREATE OR REPLACE FUNCTION calcular_kpis_dashboard()
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'equipamentos', json_build_object(
            'total', COUNT(*),
            'disponiveis', COUNT(CASE WHEN estado = 'disponivel' THEN 1 END),
            'em_uso', COUNT(CASE WHEN estado = 'em_uso' THEN 1 END),
            'manutencao', COUNT(CASE WHEN estado = 'manutencao' THEN 1 END),
            'taxa_utilizacao', ROUND(
                COUNT(CASE WHEN estado = 'em_uso' THEN 1 END)::numeric / 
                NULLIF(COUNT(*)::numeric, 0) * 100, 2
            )
        ),
        'financeiro', json_build_object(
            'valor_total_inventario', COALESCE(SUM(valor_aquisicao), 0),
            'custo_manutencoes_mes', (
                SELECT COALESCE(SUM(custo), 0) 
                FROM manutencoes_equipamentos_2025_12_13_01_00 
                WHERE data_manutencao >= DATE_TRUNC('month', CURRENT_DATE)
            ),
            'valor_medio_equipamento', COALESCE(AVG(valor_aquisicao), 0)
        ),
        'alertas', (
            SELECT json_build_object(
                'total_ativos', COUNT(*),
                'criticos', COUNT(CASE WHEN prioridade = 'critica' THEN 1 END),
                'altos', COUNT(CASE WHEN prioridade = 'alta' THEN 1 END)
            )
            FROM alertas_equipamentos_2025_12_16_07_00
            WHERE status = 'ativo'
        ),
        'manutencoes', (
            SELECT json_build_object(
                'agendadas', COUNT(CASE WHEN status = 'agendada' THEN 1 END),
                'em_andamento', COUNT(CASE WHEN status = 'em_andamento' THEN 1 END),
                'concluidas_mes', COUNT(CASE WHEN status = 'concluida' AND data_manutencao >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)
            )
            FROM manutencoes_equipamentos_2025_12_13_01_00
        ),
        'atribuicoes', (
            SELECT json_build_object(
                'ativas', COUNT(CASE WHEN estado = 'ativa' THEN 1 END),
                'vencidas', COUNT(CASE WHEN estado = 'ativa' AND data_devolucao_prevista < CURRENT_DATE THEN 1 END),
                'total_mes', COUNT(CASE WHEN data_atribuicao >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)
            )
            FROM atribuicoes_equipamentos_2025_12_13_01_00
        )
    ) INTO resultado
    FROM equipamentos_2025_12_13_01_00
    WHERE ativo = true;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 8. Verificar se as views foram criadas corretamente
SELECT 
    'Views criadas' as tipo,
    COUNT(*) as quantidade
FROM information_schema.views 
WHERE table_name IN (
    'relatorio_utilizacao_voluntarios',
    'relatorio_financeiro_equipamentos', 
    'dashboard_metricas_equipamentos',
    'analise_manutencoes',
    'analise_alertas',
    'analise_atribuicoes'
)
UNION ALL
SELECT 
    'Funções criadas',
    COUNT(*)
FROM information_schema.routines 
WHERE routine_name IN (
    'calcular_kpis_dashboard'
);