-- Verificar dados existentes e valores válidos
SELECT DISTINCT status, prioridade FROM missoes_2025_12_21_19_00 LIMIT 10;

-- Verificar estrutura completa da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_21_19_00' 
ORDER BY ordinal_position;