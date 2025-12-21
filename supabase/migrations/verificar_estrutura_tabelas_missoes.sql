-- Verificar estrutura das tabelas do módulo missões
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN (
    'missoes_2025_12_21_19_00',
    'participacoes_missoes_2025_12_21_20_00',
    'missoes_animais_2025_12_21_20_00'
)
ORDER BY table_name, ordinal_position;