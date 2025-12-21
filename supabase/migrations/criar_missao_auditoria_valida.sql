-- Criar missão de teste para auditoria com status válido
INSERT INTO missoes_2025_12_21_19_00 (
    codigo,
    titulo,
    descricao,
    data_inicio,
    data_fim,
    local_principal,
    prioridade,
    orcamento_previsto,
    status
) VALUES (
    'AUDIT-001',
    'Missão de Auditoria - Resgate de Emergência',
    'Missão criada para testar todas as funcionalidades do módulo de missões durante a auditoria completa do sistema.',
    '2025-01-15',
    '2025-01-20',
    'Centro de Resgate - Lisboa',
    'alta',
    500.00,
    'ativa'
);

-- Obter o ID da missão criada
SELECT id, codigo, titulo, status FROM missoes_2025_12_21_19_00 WHERE codigo = 'AUDIT-001';