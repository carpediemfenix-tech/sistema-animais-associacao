-- Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('atribuicoes_itens_2026_01_07_00_52', 'config_atribuicoes_2026_01_07_00_52', 'estados_itens_2026_01_07_00_52')
ORDER BY table_name, ordinal_position;