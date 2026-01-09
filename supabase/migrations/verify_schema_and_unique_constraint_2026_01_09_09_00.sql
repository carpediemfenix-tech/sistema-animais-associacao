-- Verificar se a coluna animal_id existe e seu tipo
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND column_name = 'animal_id';

-- Verificar se já existe constraint UNIQUE
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'animal_intake_assessments' 
AND constraint_type = 'UNIQUE';

-- Verificar todas as colunas da tabela para filtrar o payload
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
ORDER BY ordinal_position;

-- Se a constraint não existir, criar
DO $$
BEGIN
  -- Primeiro, remover duplicatas se existirem
  WITH duplicates AS (
    SELECT animal_id, 
           id,
           ROW_NUMBER() OVER (PARTITION BY animal_id ORDER BY created_at DESC NULLS LAST, id) as rn
    FROM animal_intake_assessments
    WHERE animal_id IS NOT NULL
  )
  DELETE FROM animal_intake_assessments 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );

  -- Tentar criar a constraint
  BEGIN
    ALTER TABLE animal_intake_assessments 
    ADD CONSTRAINT unique_animal_intake_assessments_animal_id 
    UNIQUE (animal_id);
  EXCEPTION 
    WHEN duplicate_object THEN 
      -- Constraint já existe, ignorar
      NULL;
  END;
END $$;

-- Verificar registros existentes para debug
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT animal_id) as unique_animal_ids,
  COUNT(*) - COUNT(DISTINCT animal_id) as duplicates
FROM animal_intake_assessments;