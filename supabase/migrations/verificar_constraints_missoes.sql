-- Verificar constraints da tabela missões
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'missoes_2025_12_21_19_00'::regclass
AND contype = 'c';