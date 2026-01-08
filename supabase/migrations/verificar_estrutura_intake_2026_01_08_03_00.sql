-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'animal_intake_assessments'
) as tabela_existe;