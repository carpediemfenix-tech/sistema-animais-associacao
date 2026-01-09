-- Forçar refresh do schema cache
NOTIFY pgrst, 'reload schema';

-- Verificar se os campos existem na tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
AND column_name LIKE 'behavioral%'
ORDER BY column_name;

-- Se não existirem, criar novamente com nomes mais simples
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS behavioral_animal_socialization TEXT,
ADD COLUMN IF NOT EXISTS behavioral_human_socialization TEXT,
ADD COLUMN IF NOT EXISTS behavioral_stimulus_reactions TEXT,
ADD COLUMN IF NOT EXISTS behavioral_general_temperament TEXT,
ADD COLUMN IF NOT EXISTS physical_cardiovascular TEXT,
ADD COLUMN IF NOT EXISTS physical_respiratory TEXT,
ADD COLUMN IF NOT EXISTS physical_neurological TEXT,
ADD COLUMN IF NOT EXISTS physical_gastrointestinal TEXT,
ADD COLUMN IF NOT EXISTS physical_musculoskeletal TEXT,
ADD COLUMN IF NOT EXISTS physical_integumentary TEXT,
ADD COLUMN IF NOT EXISTS care_immediate TEXT,
ADD COLUMN IF NOT EXISTS care_medium_term TEXT,
ADD COLUMN IF NOT EXISTS care_long_term TEXT;

-- Criar uma view simplificada para debug
CREATE OR REPLACE VIEW animal_intake_debug AS
SELECT 
  animal_id,
  intake_origin,
  general_condition,
  behavior_entry,
  body_condition,
  symptoms,
  immediate_actions,
  authorities_involved,
  rescue_type,
  owner_name,
  found_location,
  physical_exam_notes,
  behavioral_notes,
  treatment_plan
FROM animal_intake_assessments;

-- Garantir que a tabela localizacoes_animal funcione
DROP TABLE IF EXISTS localizacoes_animal CASCADE;
CREATE TABLE localizacoes_animal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  localizacao TEXT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_localizacoes_animal_id ON localizacoes_animal(animal_id);
CREATE INDEX idx_localizacoes_ativo ON localizacoes_animal(ativo);

-- RLS
ALTER TABLE localizacoes_animal ENABLE ROW LEVEL SECURITY;

-- Políticas simples
CREATE POLICY "allow_all_localizacoes" ON localizacoes_animal FOR ALL USING (true);

-- Inserir dados de teste
INSERT INTO localizacoes_animal (animal_id, localizacao, ativo, observacoes)
VALUES 
  ('96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid, 'Canil Principal', true, 'Localização atual'),
  ('96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid, 'Quarentena', false, 'Localização anterior')
ON CONFLICT DO NOTHING;