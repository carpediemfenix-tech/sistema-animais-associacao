-- Verificar participações do voluntário 16d380ce-275a-4594-bcac-a968a111ab0d
SELECT 
    p.id as participacao_id,
    p.voluntario_id,
    p.missao_id,
    p.funcao,
    p.data_participacao,
    p.horas_dedicadas,
    p.observacoes
FROM participacoes_missoes_2025_12_29_07_00 p
WHERE p.voluntario_id = '16d380ce-275a-4594-bcac-a968a111ab0d'
ORDER BY p.data_participacao DESC;

-- Verificar se a missão 8c9252a3-fe8e-48a8-a8c3-6ff20b4977ed existe na tabela de missões
SELECT 
    id,
    codigo,
    titulo,
    data_inicio,
    data_fim,
    status
FROM missoes_2025_12_18_14_15
WHERE id = '8c9252a3-fe8e-48a8-a8c3-6ff20b4977ed';

-- Verificar todas as participações na missão específica
SELECT 
    p.id as participacao_id,
    p.voluntario_id,
    p.funcao,
    p.data_participacao,
    v.nome as voluntario_nome
FROM participacoes_missoes_2025_12_29_07_00 p
LEFT JOIN voluntarios v ON p.voluntario_id = v.id
WHERE p.missao_id = '8c9252a3-fe8e-48a8-a8c3-6ff20b4977ed'
ORDER BY p.data_participacao DESC;