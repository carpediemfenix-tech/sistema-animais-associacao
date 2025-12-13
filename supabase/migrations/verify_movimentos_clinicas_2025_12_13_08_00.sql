-- Verificar movimentos financeiros existentes
SELECT COUNT(*) as total_movimentos FROM movimentos_financeiros_2025_12_13_06_00;

-- Verificar movimentos ligados a intervenções
SELECT COUNT(*) as movimentos_intervencoes 
FROM movimentos_financeiros_2025_12_13_06_00 
WHERE intervencao_id IS NOT NULL;

-- Verificar movimentos por categoria
SELECT 
    cf.nome as categoria,
    COUNT(*) as quantidade,
    SUM(mf.valor) as valor_total
FROM movimentos_financeiros_2025_12_13_06_00 mf
JOIN categorias_financeiras_2025_12_13_06_00 cf ON mf.categoria_id = cf.id
GROUP BY cf.nome, cf.codigo
ORDER BY cf.codigo;

-- Verificar intervenções com custo
SELECT COUNT(*) as intervencoes_com_custo
FROM intervencoes 
WHERE (custo_final > 0 OR custo > 0);

-- Verificar exemplo de movimento de intervenção
SELECT 
    mf.numero_movimento,
    mf.descricao,
    mf.valor,
    mf.data_movimento,
    cf.nome as categoria,
    a.nome as animal_nome
FROM movimentos_financeiros_2025_12_13_06_00 mf
LEFT JOIN categorias_financeiras_2025_12_13_06_00 cf ON mf.categoria_id = cf.id
LEFT JOIN animais a ON mf.animal_id = a.id
WHERE mf.intervencao_id IS NOT NULL
LIMIT 5;