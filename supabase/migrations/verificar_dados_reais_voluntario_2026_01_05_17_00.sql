-- Verificar participações reais do voluntário 16d380ce-275a-4594-bcac-a968a111ab0d
SELECT 
    p.id as participacao_id,
    p.voluntario_id,
    p.missao_id,
    p.funcao,
    p.data_participacao,
    p.horas_dedicadas,
    p.observacoes,
    p.created_at
FROM participacoes_missoes_2025_12_29_07_00 p
WHERE p.voluntario_id = '16d380ce-275a-4594-bcac-a968a111ab0d'
ORDER BY p.data_participacao DESC;

-- Verificar se existe a missão DEN26002 nas tabelas de missões
SELECT 
    'missoes_2025_12_29_07_00' as tabela,
    id,
    codigo,
    titulo,
    data_inicio,
    data_fim,
    status
FROM missoes_2025_12_29_07_00
WHERE titulo LIKE '%DEN26002%' OR codigo LIKE '%DEN26002%'

UNION ALL

SELECT 
    'missoes_2025_12_18_14_15' as tabela,
    id,
    codigo,
    titulo,
    data_inicio,
    data_fim,
    status
FROM missoes_2025_12_18_14_15
WHERE titulo LIKE '%DEN26002%' OR codigo LIKE '%DEN26002%';

-- Verificar todas as missões que contêm "Resgate" no título
SELECT 
    'missoes_2025_12_29_07_00' as tabela,
    id,
    codigo,
    titulo,
    data_inicio,
    status
FROM missoes_2025_12_29_07_00
WHERE titulo ILIKE '%resgate%'

UNION ALL

SELECT 
    'missoes_2025_12_18_14_15' as tabela,
    id,
    codigo,
    titulo,
    data_inicio,
    status
FROM missoes_2025_12_18_14_15
WHERE titulo ILIKE '%resgate%'
ORDER BY data_inicio DESC;