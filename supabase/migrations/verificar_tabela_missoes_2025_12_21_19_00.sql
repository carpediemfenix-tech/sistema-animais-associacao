-- Verificar se a tabela existe e sua estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'missoes_2025_12_18_14_15'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM missoes_2025_12_18_14_15;

-- Testar uma query simples
SELECT id, codigo, titulo FROM missoes_2025_12_18_14_15 LIMIT 5;