-- Adicionar coluna localizacao_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'localizacoes_animal' AND column_name = 'localizacao_id') THEN
        ALTER TABLE localizacoes_animal ADD COLUMN localizacao_id UUID REFERENCES localizacoes(id);
    END IF;
END $$;

-- Migrar dados existentes de tipo_localizacao para localizacao_id
-- Primeiro, vamos criar algumas localizações padrão se não existirem
INSERT INTO localizacoes (nome, descricao, ativo) 
VALUES 
  ('Casa de Acolhimento', 'Localização principal da associação', true),
  ('Família de Acolhimento Temporário', 'Animal em família temporária', true),
  ('Clínica Veterinária', 'Animal em tratamento veterinário', true),
  ('Quarentena', 'Animal em período de quarentena', true),
  ('Adotado', 'Animal já adotado', true)
ON CONFLICT (nome) DO NOTHING;

-- Migrar dados existentes baseado no tipo_localizacao (se existir)
UPDATE localizacoes_animal 
SET localizacao_id = (
  SELECT id FROM localizacoes 
  WHERE nome = CASE 
    WHEN localizacoes_animal.tipo_localizacao ILIKE '%casa%' OR localizacoes_animal.tipo_localizacao ILIKE '%acolhimento%' THEN 'Casa de Acolhimento'
    WHEN localizacoes_animal.tipo_localizacao ILIKE '%familia%' OR localizacoes_animal.tipo_localizacao ILIKE '%temporario%' THEN 'Família de Acolhimento Temporário'
    WHEN localizacoes_animal.tipo_localizacao ILIKE '%clinica%' OR localizacoes_animal.tipo_localizacao ILIKE '%veterinari%' THEN 'Clínica Veterinária'
    WHEN localizacoes_animal.tipo_localizacao ILIKE '%quarentena%' THEN 'Quarentena'
    WHEN localizacoes_animal.tipo_localizacao ILIKE '%adot%' THEN 'Adotado'
    ELSE 'Casa de Acolhimento'
  END
  LIMIT 1
)
WHERE localizacao_id IS NULL;