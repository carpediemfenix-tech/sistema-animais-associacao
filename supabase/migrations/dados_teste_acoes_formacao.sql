-- Adicionar dados de teste para acoes_formacao
-- Verificar se a tabela está vazia e adicionar dados
INSERT INTO acoes_formacao (id, nome, descricao, tipo, duracao_horas, data_inicio, data_fim, local, instrutor, max_participantes, ativo, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Primeiros Socorros para Animais', 'Curso básico de primeiros socorros veterinários para voluntários', 'curso', 8, '2024-01-15', '2024-01-15', 'Centro de Formação Valentão', 'Dr. Maria Silva', 20, true, NOW(), NOW()),
    (gen_random_uuid(), 'Técnicas de Resgate', 'Workshop sobre técnicas seguras de resgate de animais', 'workshop', 4, '2024-02-10', '2024-02-10', 'Campo de Treino', 'João Santos', 15, true, NOW(), NOW()),
    (gen_random_uuid(), 'Comportamento Animal', 'Seminário sobre comportamento e bem-estar animal', 'seminario', 6, '2024-03-05', '2024-03-05', 'Auditório Principal', 'Dra. Ana Costa', 25, true, NOW(), NOW()),
    (gen_random_uuid(), 'Nutrição Animal', 'Curso avançado sobre nutrição para diferentes espécies', 'curso', 12, '2024-04-20', '2024-04-21', 'Laboratório de Nutrição', 'Prof. Carlos Mendes', 18, true, NOW(), NOW()),
    (gen_random_uuid(), 'Legislação Animal', 'Workshop sobre legislação de proteção animal', 'workshop', 3, '2024-05-15', '2024-05-15', 'Sala de Conferências', 'Dra. Patrícia Rocha', 30, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar quantos registos foram inseridos
SELECT COUNT(*) as total_acoes FROM acoes_formacao;