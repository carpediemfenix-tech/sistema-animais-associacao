-- Verificar estrutura completa da tabela de atribuições
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'atribuicoes_itens_2026_01_07_00_52'
ORDER BY ordinal_position;

-- Verificar dados existentes na tabela
SELECT COUNT(*) as total_atribuicoes FROM atribuicoes_itens_2026_01_07_00_52;

-- Mostrar algumas atribuições existentes para entender a estrutura
SELECT * FROM atribuicoes_itens_2026_01_07_00_52 LIMIT 3;