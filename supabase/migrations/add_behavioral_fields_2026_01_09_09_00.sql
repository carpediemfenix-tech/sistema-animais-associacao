-- Adicionar campos de avaliação comportamental e outros em falta
ALTER TABLE animal_intake_assessments 
ADD COLUMN IF NOT EXISTS behavioral_assessment_animal_socialization TEXT,
ADD COLUMN IF NOT EXISTS behavioral_assessment_human_socialization TEXT,
ADD COLUMN IF NOT EXISTS behavioral_assessment_stimulus_reactions TEXT,
ADD COLUMN IF NOT EXISTS behavioral_assessment_general_temperament TEXT,
ADD COLUMN IF NOT EXISTS physical_exam_cardiovascular TEXT,
ADD COLUMN IF NOT EXISTS physical_exam_respiratory TEXT,
ADD COLUMN IF NOT EXISTS physical_exam_neurological TEXT,
ADD COLUMN IF NOT EXISTS physical_exam_gastrointestinal TEXT,
ADD COLUMN IF NOT EXISTS physical_exam_musculoskeletal TEXT,
ADD COLUMN IF NOT EXISTS physical_exam_integumentary TEXT,
ADD COLUMN IF NOT EXISTS care_plan_immediate TEXT,
ADD COLUMN IF NOT EXISTS care_plan_medium_term TEXT,
ADD COLUMN IF NOT EXISTS care_plan_long_term TEXT;

-- Verificar se existe problema com a tabela localizacoes_animal
-- Recriar com nome mais simples se necessário
DROP TABLE IF EXISTS animal_locations_temp;
CREATE TABLE animal_locations_temp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  location_name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_animal_locations_temp_animal_id ON animal_locations_temp(animal_id);
CREATE INDEX idx_animal_locations_temp_active ON animal_locations_temp(is_active);

-- RLS
ALTER TABLE animal_locations_temp ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Public can view animal locations temp" ON animal_locations_temp
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage animal locations temp" ON animal_locations_temp
FOR ALL USING (auth.role() = 'authenticated');

-- Inserir dados de exemplo se a tabela original existir
INSERT INTO animal_locations_temp (animal_id, location_name, start_date, is_active, notes)
SELECT 
  '96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid as animal_id,
  'Canil Principal' as location_name,
  CURRENT_DATE as start_date,
  true as is_active,
  'Localização inicial' as notes
WHERE NOT EXISTS (
  SELECT 1 FROM animal_locations_temp 
  WHERE animal_id = '96a3f154-d4cf-4aa1-b329-5398b948fe11'::uuid
);