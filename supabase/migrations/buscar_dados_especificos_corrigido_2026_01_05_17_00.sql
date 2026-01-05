-- Verificar dados reais do voluntário específico
SELECT 
    p.id,
    p.voluntario_id,
    p.missao_id,
    p.funcao,
    p.data_participacao,
    p.observacoes
FROM participacoes_missoes_2025_12_29_07_00 p
WHERE p.voluntario_id = '16d380ce-275a-4594-bcac-a968a111ab0d';

-- Verificar se existe missão com DEN26002 na tabela mais recente
SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    status
FROM missoes_2025_12_29_07_00
WHERE titulo ILIKE '%DEN26002%' OR codigo ILIKE '%DEN26002%';

-- Verificar se existe missão com DEN26002 na tabela antiga
SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    status
FROM missoes_2025_12_18_14_15
WHERE titulo ILIKE '%DEN26002%' OR codigo ILIKE '%DEN26002%';

-- Verificar se existe alguma referência a DEN25007
SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    status
FROM missoes_2025_12_29_07_00
WHERE titulo ILIKE '%DEN25007%' OR codigo ILIKE '%DEN25007%'

UNION ALL

SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    status
FROM missoes_2025_12_18_14_15
WHERE titulo ILIKE '%DEN25007%' OR codigo ILIKE '%DEN25007%';