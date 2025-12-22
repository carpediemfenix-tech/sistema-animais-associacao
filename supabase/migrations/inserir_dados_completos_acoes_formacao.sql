-- Inserir dados completos na tabela acoes_formacao
INSERT INTO acoes_formacao (
    id, 
    codigo_acao, 
    nome_acao, 
    descricao_acao, 
    tipo_acao, 
    duracao_horas, 
    data_inicio, 
    data_fim, 
    local_formacao, 
    instrutor, 
    max_participantes, 
    min_participantes, 
    custo_formacao, 
    status_acao, 
    ativo, 
    created_at, 
    updated_at
)
VALUES 
    (gen_random_uuid(), 'FORM001', 'Primeiros Socorros para Animais', 'Curso básico de primeiros socorros veterinários', 'curso', 8, '2024-01-15', '2024-01-15', 'Centro de Formação', 'Dr. Maria Silva', 20, 5, 0.00, 'planeada', true, NOW(), NOW()),
    (gen_random_uuid(), 'FORM002', 'Técnicas de Resgate', 'Workshop sobre técnicas de resgate de animais', 'workshop', 4, '2024-02-10', '2024-02-10', 'Campo de Treino', 'João Santos', 15, 3, 0.00, 'planeada', true, NOW(), NOW()),
    (gen_random_uuid(), 'FORM003', 'Comportamento Animal', 'Seminário sobre comportamento animal', 'seminario', 6, '2024-03-05', '2024-03-05', 'Auditório', 'Dra. Ana Costa', 25, 5, 0.00, 'planeada', true, NOW(), NOW())
ON CONFLICT (codigo_acao) DO NOTHING;

-- Verificar dados inseridos
SELECT codigo_acao, nome_acao, tipo_acao, ativo FROM acoes_formacao;