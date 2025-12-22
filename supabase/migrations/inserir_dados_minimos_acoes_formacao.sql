-- Inserir dados mínimos na tabela acoes_formacao
INSERT INTO acoes_formacao (codigo_acao, nome_acao, ativo)
VALUES 
    ('FORM001', 'Primeiros Socorros para Animais', true),
    ('FORM002', 'Técnicas de Resgate', true),
    ('FORM003', 'Comportamento Animal', true),
    ('FORM004', 'Nutrição Animal', true),
    ('FORM005', 'Legislação Animal', true)
ON CONFLICT (codigo_acao) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total FROM acoes_formacao;