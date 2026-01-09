-- Verificar todos os campos da tabela animal_intake_assessments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
ORDER BY ordinal_position;

-- Verificar se há algum campo com constraint NOT NULL que pode estar causando problema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND is_nullable = 'NO'
ORDER BY column_name;

-- Verificar a estrutura da tabela localizacoes_animal
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'localizacoes_animal' 
ORDER BY ordinal_position;

-- Criar uma view para debug das tentativas de inserção
CREATE OR REPLACE VIEW debug_intake_insert AS
SELECT 
  animal_id,
  intake_origin,
  general_condition,
  behavior_entry,
  body_condition,
  symptoms,
  immediate_actions,
  created_at
FROM animal_intake_assessments
WHERE animal_id = '96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid
ORDER BY created_at DESC
LIMIT 5;