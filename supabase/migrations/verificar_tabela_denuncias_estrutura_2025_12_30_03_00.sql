-- Verificar se a tabela denuncias existe
SELECT 
    'Tabela denuncias' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00';

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'denuncias_2025_12_29_23_00' 
ORDER BY ordinal_position;

-- Verificar se existe a função de geração de código
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%codigo_denuncia%' OR routine_name LIKE '%denuncia%';

-- Verificar dados existentes na tabela
SELECT COUNT(*) as total_denuncias FROM public.denuncias_2025_12_29_23_00;