-- Verificar estrutura completa da tabela de participações
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participacoes_missoes_2025_12_29_07_00'
ORDER BY ordinal_position;

-- Verificar dados existentes para entender o formato
SELECT 
    id,
    voluntario_id,
    funcao,
    data_participacao,
    data_fim,
    horas_dedicadas,
    observacoes,
    created_at
FROM participacoes_missoes_2025_12_29_07_00
WHERE missao_id = '8c9252a3-fe8e-48a8-a8c3-6ff20b4977ed'
LIMIT 3;