-- Inserir dados usando apenas campos que existem
INSERT INTO acoes_formacao (
    codigo_acao, 
    nome_acao, 
    tipo_acao, 
    duracao_horas, 
    max_participantes, 
    min_participantes, 
    custo_formacao, 
    status_acao, 
    ativo
)
VALUES 
    ('FORM001', 'Primeiros Socorros para Animais', 'curso', 8, 20, 5, 0.00, 'planeada', true),
    ('FORM002', 'Técnicas de Resgate', 'workshop', 4, 15, 3, 0.00, 'planeada', true),
    ('FORM003', 'Comportamento Animal', 'seminario', 6, 25, 5, 0.00, 'planeada', true),
    ('FORM004', 'Nutrição Animal', 'curso', 12, 18, 4, 0.00, 'planeada', true),
    ('FORM005', 'Legislação Animal', 'workshop', 3, 30, 8, 0.00, 'planeada', true)
ON CONFLICT (codigo_acao) DO NOTHING;

-- Verificar dados inseridos
SELECT codigo_acao, nome_acao, tipo_acao, ativo FROM acoes_formacao;