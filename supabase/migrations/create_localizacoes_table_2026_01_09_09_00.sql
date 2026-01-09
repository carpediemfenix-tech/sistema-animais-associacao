-- Criar tabela localizacoes se não existir (para compatibilidade)
CREATE TABLE IF NOT EXISTS localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas localizações padrão
INSERT INTO localizacoes (nome, descricao) VALUES
  ('Canil Principal', 'Área principal de alojamento dos cães'),
  ('Gatil', 'Área destinada aos gatos'),
  ('Quarentena', 'Área de isolamento para novos animais'),
  ('Enfermaria', 'Área para animais em tratamento médico'),
  ('Adoção Temporária', 'Animal em casa temporária')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;

-- Política permissiva
CREATE POLICY "Allow all operations on localizacoes" ON localizacoes
FOR ALL USING (true);

-- Verificar se há problemas com campos NOT NULL na tabela animal_intake_assessments
-- Tornar alguns campos opcionais para evitar erros
ALTER TABLE animal_intake_assessments 
ALTER COLUMN assessed_by DROP NOT NULL,
ALTER COLUMN assessment_date DROP NOT NULL;

-- Adicionar valores padrão para campos que podem estar causando problema
UPDATE animal_intake_assessments 
SET 
  assessed_by = COALESCE(assessed_by, auth.uid()),
  assessment_date = COALESCE(assessment_date, NOW())
WHERE assessed_by IS NULL OR assessment_date IS NULL;