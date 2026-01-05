-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00'
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT * FROM equipamentos_2025_12_13_01_00 LIMIT 3;