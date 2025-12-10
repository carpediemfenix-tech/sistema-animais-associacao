-- Inserir responsabilidades de exemplo para testar
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
    ativo
)
SELECT 
    v.id,
    a.id,
    'Preparação para Adoção',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '30 days',
    false
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
    rv.ativo
FROM responsabilidades_voluntarios rv
JOIN voluntarios v ON rv.voluntario_id = v.id
JOIN animais a ON rv.animal_id = a.id
ORDER BY rv.created_at DESC
LIMIT 10;

-- Contar responsabilidades por voluntário
SELECT 
    v.nome as voluntario,
    COUNT(CASE WHEN rv.ativo = true THEN 1 END) as ativas,
    COUNT(CASE WHEN rv.ativo = false THEN 1 END) as finalizadas,
    COUNT(rv.id) as total
FROM voluntarios v
LEFT JOIN responsabilidades_voluntarios rv ON v.id = rv.voluntario_id
GROUP BY v.id, v.nome
HAVING COUNT(rv.id) > 0
ORDER BY total DESC;