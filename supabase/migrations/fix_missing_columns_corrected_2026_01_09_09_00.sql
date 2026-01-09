-- Adicionar campos em falta na tabela animal_intake_assessments
ALTER TABLE animal_intake_assessments 
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
ADD COLUMN IF NOT EXISTS physical_exam_notes TEXT,
ADD COLUMN IF NOT EXISTS behavioral_notes TEXT,
ADD COLUMN IF NOT EXISTS prognosis TEXT,
ADD COLUMN IF NOT EXISTS treatment_plan TEXT,
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS immediate_actions_notes TEXT,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS temperature_celsius DECIMAL(4,1);

-- Verificar se a tabela localizacoes_animal existe, se não, criar
CREATE TABLE IF NOT EXISTS localizacoes_animal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
  localizacao TEXT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_animal_id ON localizacoes_animal(animal_id);
CREATE INDEX IF NOT EXISTS idx_localizacoes_animal_ativo ON localizacoes_animal(ativo);

-- RLS para localizacoes_animal
ALTER TABLE localizacoes_animal ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Public can view animal locations" ON localizacoes_animal;
DROP POLICY IF EXISTS "Authenticated users can insert animal locations" ON localizacoes_animal;
DROP POLICY IF EXISTS "Authenticated users can update animal locations" ON localizacoes_animal;
DROP POLICY IF EXISTS "Authenticated users can delete animal locations" ON localizacoes_animal;

-- Criar políticas RLS para localizacoes_animal
CREATE POLICY "Public can view animal locations" ON localizacoes_animal
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert animal locations" ON localizacoes_animal
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update animal locations" ON localizacoes_animal
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete animal locations" ON localizacoes_animal
FOR DELETE USING (auth.role() = 'authenticated');