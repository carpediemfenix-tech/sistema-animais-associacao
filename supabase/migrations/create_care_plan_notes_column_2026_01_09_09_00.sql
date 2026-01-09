-- Criar a coluna care_plan_notes que está em falta
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS care_plan_notes TEXT;

-- Verificar se há outras colunas em falta que estão no payload filtrado
-- Baseado na lista de validFields do código
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS clinical_observations TEXT,
ADD COLUMN IF NOT EXISTS intake_summary TEXT;

-- Forçar refresh do schema cache
NOTIFY pgrst, 'reload schema';

-- Verificar todas as colunas que existem agora
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
ORDER BY column_name;

-- Verificar especificamente se care_plan_notes foi criada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND column_name = 'care_plan_notes';

-- Testar inserção com care_plan_notes para garantir que funciona
INSERT INTO animal_intake_assessments (
  animal_id, 
  care_plan_notes,
  assessment_date
) VALUES (
  gen_random_uuid(),
  'Teste care_plan_notes',
  NOW()
) ON CONFLICT (animal_id) DO UPDATE SET
  care_plan_notes = EXCLUDED.care_plan_notes;

-- Remover o registro de teste
DELETE FROM animal_intake_assessments 
WHERE care_plan_notes = 'Teste care_plan_notes';