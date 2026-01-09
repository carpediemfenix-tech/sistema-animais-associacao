-- Verificar quais campos do payload filtrado NÃO existem na tabela
WITH payload_fields AS (
  SELECT unnest(ARRAY[
    'animal_id', 'assessment_date', 'assessed_by', 'intake_origin', 'intake_reason',
    'general_condition', 'behavior_entry', 'body_condition', 'symptoms', 'immediate_actions',
    'clinical_observations', 'intake_summary', 'weight_kg', 'temperature_celsius',
    'authorities_involved', 'rescue_type', 'rescue_circumstances',
    'owner_name', 'owner_contact', 'owner_address', 'surrender_reason',
    'found_location', 'finder_name', 'found_conditions',
    'origin_institution', 'origin_contact', 'transfer_documents', 'transfer_reason',
    'mother_id', 'litter_size', 'birth_conditions',
    'physical_exam_notes', 'physical_cardiovascular', 'physical_respiratory',
    'physical_neurological', 'physical_gastrointestinal', 'physical_musculoskeletal', 'physical_integumentary',
    'behavioral_notes', 'behavioral_general_temperament', 'behavioral_human_socialization',
    'behavioral_animal_socialization', 'behavioral_stimulus_reactions',
    'treatment_plan', 'care_immediate', 'care_medium_term', 'care_long_term', 'care_plan_notes',
    'special_needs', 'immediate_actions_notes'
  ]) AS field_name
),
existing_fields AS (
  SELECT column_name
  FROM information_schema.columns 
  WHERE table_name = 'animal_intake_assessments'
)
SELECT 
  pf.field_name,
  CASE WHEN ef.column_name IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM payload_fields pf
LEFT JOIN existing_fields ef ON pf.field_name = ef.column_name
ORDER BY status DESC, pf.field_name;

-- Criar todos os campos que podem estar em falta
-- (alguns podem já existir, por isso IF NOT EXISTS)
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS clinical_observations TEXT,
ADD COLUMN IF NOT EXISTS intake_summary TEXT,
ADD COLUMN IF NOT EXISTS authorities_involved TEXT,
ADD COLUMN IF NOT EXISTS rescue_type TEXT,
ADD COLUMN IF NOT EXISTS rescue_circumstances TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_contact TEXT,
ADD COLUMN IF NOT EXISTS owner_address TEXT,
ADD COLUMN IF NOT EXISTS surrender_reason TEXT,
ADD COLUMN IF NOT EXISTS found_location TEXT,
ADD COLUMN IF NOT EXISTS finder_name TEXT,
ADD COLUMN IF NOT EXISTS found_conditions TEXT,
ADD COLUMN IF NOT EXISTS origin_institution TEXT,
ADD COLUMN IF NOT EXISTS origin_contact TEXT,
ADD COLUMN IF NOT EXISTS transfer_documents TEXT,
ADD COLUMN IF NOT EXISTS transfer_reason TEXT,
ADD COLUMN IF NOT EXISTS mother_id TEXT,
ADD COLUMN IF NOT EXISTS litter_size INTEGER,
ADD COLUMN IF NOT EXISTS birth_conditions TEXT,
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS immediate_actions_notes TEXT;

-- Forçar refresh do schema cache novamente
NOTIFY pgrst, 'reload schema';