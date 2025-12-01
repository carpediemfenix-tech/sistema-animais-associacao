-- Verificar a constraint de estado da tabela animais
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'animais_estado_check';

-- Verificar valores únicos existentes na coluna estado
SELECT DISTINCT estado, COUNT(*) as quantidade
FROM animais 
GROUP BY estado 
ORDER BY quantidade DESC;

-- Verificar estrutura da coluna estado
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animais' 
AND column_name = 'estado';