-- Verificar estrutura da tabela especialidades_voluntarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'especialidades_voluntarios_2025_12_21_22_00'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela voluntario_especialidades  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'voluntario_especialidades_2025_12_21_22_00'
ORDER BY ordinal_position;