-- Inserir responsabilidades de exemplo para testar
-- Primeiro, vamos verificar IDs de voluntários e animais existentes
WITH voluntarios_sample AS (
    SELECT id, nome FROM voluntarios ORDER BY nome LIMIT 5
),
animais_sample AS (
    SELECT id, nome FROM animais WHERE arquivado = false ORDER BY nome LIMIT 5
)
SELECT 
    v.id as voluntario_id, v.nome as voluntario_nome,
    a.id as animal_id, a.nome as animal_nome
FROM voluntarios_sample v
CROSS JOIN animais_sample a
LIMIT 10;

-- Inserir responsabilidades de exemplo
INSERT INTO responsabilidades_voluntarios (
    voluntario_id, 
    animal_id, 
    tipo_responsabilidade,
    data_inicio, 
    ativo
)
SELECT 
    v.id,
    a.id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'Cuidador Principal'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'Administração de Medicação'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'Acompanhamento Veterinário'
        ELSE 'Socialização'
    END,
    NOW() - INTERVAL '30 days' * (ROW_NUMBER() OVER() % 6),
    CASE WHEN ROW_NUMBER() OVER() % 3 = 0 THEN false ELSE true END
FROM (SELECT id FROM voluntarios ORDER BY nome LIMIT 3) v
CROSS JOIN (SELECT id FROM animais WHERE arquivado = false ORDER BY nome LIMIT 2) a
ON CONFLICT DO NOTHING;

-- Inserir algumas responsabilidades finalizadas (histórico)
INSERT INTO responsabilidades_voluntarios (
    voluntario_id, 
    animal_id, 
    tipo_responsabilidade,
    data_inicio,
    data_fim,
    ativo,
    motivo_fim
)
SELECT 
    v.id,
    a.id,
    'Preparação para Adoção',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '30 days',
    false,
    'Animal foi adotado com sucesso'
FROM (SELECT id FROM voluntarios ORDER BY nome LIMIT 2) v
CROSS JOIN (SELECT id FROM animais WHERE estado = 'Adotado' ORDER BY nome LIMIT 1) a
ON CONFLICT DO NOTHING;

-- Verificar dados inseridos
SELECT 
    rv.id,
    v.nome as voluntario,
    a.nome as animal,
    rv.tipo_responsabilidade,
    rv.data_inicio,
    rv.data_fim,
    rv.ativo,
    rv.motivo_fim
FROM responsabilidades_voluntarios rv
JOIN voluntarios v ON rv.voluntario_id = v.id
JOIN animais a ON rv.animal_id = a.id
ORDER BY rv.created_at DESC;