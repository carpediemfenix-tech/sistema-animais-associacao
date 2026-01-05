-- Verificar estrutura da tabela equipamentos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_equipamentos FROM equipamentos_2025_12_13_01_00;

-- Verificar estrutura da tabela de tipos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tipos_equipamentos_2025_12_13_01_00'
ORDER BY ordinal_position;