-- Criar a coluna care_plan_notes que está em falta
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS care_plan_notes TEXT;

-- Criar outras colunas que podem estar em falta
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS clinical_observations TEXT,
ADD COLUMN IF NOT EXISTS intake_summary TEXT;

-- Forçar refresh do schema cache
NOTIFY pgrst, 'reload schema';

-- Verificar se care_plan_notes foi criada
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND column_name IN ('care_plan_notes', 'clinical_observations', 'intake_summary')
ORDER BY column_name;