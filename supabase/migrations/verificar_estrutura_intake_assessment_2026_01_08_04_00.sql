-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a função existe
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_animal_intake_assessment' 
  AND routine_schema = 'public';