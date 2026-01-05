-- Verificar se existe alguma referência a DEN25007 nas tabelas
SELECT 'participacoes' as origem, id, voluntario_id, missao_id, funcao, observacoes
FROM participacoes_missoes_2025_12_29_07_00
WHERE observacoes ILIKE '%DEN25007%' OR funcao ILIKE '%DEN25007%'

UNION ALL

SELECT 'missoes_2025_12_29_07_00' as origem, id, codigo, titulo, descricao, status
FROM missoes_2025_12_29_07_00
WHERE titulo ILIKE '%DEN25007%' OR codigo ILIKE '%DEN25007%' OR descricao ILIKE '%DEN25007%'

UNION ALL

SELECT 'missoes_2025_12_18_14_15' as origem, id, codigo, titulo, descricao, status
FROM missoes_2025_12_18_14_15
WHERE titulo ILIKE '%DEN25007%' OR codigo ILIKE '%DEN25007%' OR descricao ILIKE '%DEN25007%';

-- Verificar dados reais do voluntário específico
SELECT 
    p.id,
    p.voluntario_id,
    p.missao_id,
    p.funcao,
    p.data_participacao,
    p.observacoes,
    'participacao_real' as tipo
FROM participacoes_missoes_2025_12_29_07_00 p
WHERE p.voluntario_id = '16d380ce-275a-4594-bcac-a968a111ab0d';

-- Verificar se existe missão com DEN26002
SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    status,
    'missao_real' as tipo
FROM missoes_2025_12_29_07_00
WHERE titulo ILIKE '%DEN26002%' OR codigo ILIKE '%DEN26002%'

UNION ALL

SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    status,
    'missao_real' as tipo
FROM missoes_2025_12_18_14_15
WHERE titulo ILIKE '%DEN26002%' OR codigo ILIKE '%DEN26002%';