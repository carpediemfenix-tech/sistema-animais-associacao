-- Verificar se as tabelas de equipamentos existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%equipamentos%' 
   OR table_name LIKE '%categorias_equipamentos%'
   OR table_name LIKE '%tipos_equipamentos%';

-- Verificar estrutura da tabela equipamentos
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela tipos_equipamentos
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tipos_equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela categorias_equipamentos
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'categorias_equipamentos_2025_12_13_01_00' 
ORDER BY ordinal_position;