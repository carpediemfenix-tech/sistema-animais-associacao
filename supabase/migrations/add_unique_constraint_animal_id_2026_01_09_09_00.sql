-- Adicionar constraint UNIQUE em animal_id para permitir upsert
ALTER TABLE animal_intake_assessments 
ADD CONSTRAINT unique_animal_intake_assessment 
UNIQUE (animal_id);

-- Verificar se há duplicatas antes de aplicar a constraint
-- Se houver, manter apenas a mais recente
WITH duplicates AS (
  SELECT animal_id, 
         id,
         ROW_NUMBER() OVER (PARTITION BY animal_id ORDER BY created_at DESC) as rn
  FROM animal_intake_assessments
  WHERE animal_id IS NOT NULL
)
DELETE FROM animal_intake_assessments 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verificar o tipo do campo id
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND column_name = 'id';

-- Log para debug - verificar registros existentes
SELECT 
  id,
  animal_id,
  created_at,
  pg_typeof(id) as id_type,
  pg_typeof(animal_id) as animal_id_type
FROM animal_intake_assessments 
WHERE animal_id = '96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid
ORDER BY created_at DESC;