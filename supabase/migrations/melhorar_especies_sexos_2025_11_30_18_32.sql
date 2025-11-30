-- Melhorias nas tabelas de espécies e sexos
-- Adicionar coluna ícone na tabela espécies (se não existir)
ALTER TABLE especies ADD COLUMN IF NOT EXISTS icone TEXT;

-- Atualizar espécies existentes com ícones
UPDATE especies SET icone = '🐕' WHERE nome ILIKE '%cão%' OR nome ILIKE '%cao%';
UPDATE especies SET icone = '🐱' WHERE nome ILIKE '%gato%';
UPDATE especies SET icone = '🐰' WHERE nome ILIKE '%coelho%';
UPDATE especies SET icone = '🐹' WHERE nome ILIKE '%hamster%';
UPDATE especies SET icone = '🐦' WHERE nome ILIKE '%pássaro%' OR nome ILIKE '%passaro%' OR nome ILIKE '%ave%';
UPDATE especies SET icone = '🐠' WHERE nome ILIKE '%peixe%';
UPDATE especies SET icone = '🐢' WHERE nome ILIKE '%tartaruga%';
UPDATE especies SET icone = '🐾' WHERE icone IS NULL;

-- Inserir espécies padrão se não existirem
INSERT INTO especies (nome, icone, descricao, ativo) 
VALUES 
  ('Cão', '🐕', 'Cães domésticos', true),
  ('Gato', '🐱', 'Gatos domésticos', true),
  ('Coelho', '🐰', 'Coelhos domésticos', true),
  ('Hamster', '🐹', 'Hamsters e roedores pequenos', true),
  ('Pássaro', '🐦', 'Aves domésticas', true),
  ('Peixe', '🐠', 'Peixes ornamentais', true),
  ('Tartaruga', '🐢', 'Tartarugas e répteis', true),
  ('Outro', '🐾', 'Outras espécies', true)
ON CONFLICT (nome) DO UPDATE SET 
  icone = EXCLUDED.icone,
  descricao = EXCLUDED.descricao;

-- Inserir opção "Indeterminado" na tabela sexos se não existir
INSERT INTO sexos (nome, descricao, ativo) 
VALUES 
  ('Macho', 'Sexo masculino', true),
  ('Fêmea', 'Sexo feminino', true),
  ('Indeterminado', 'Sexo não determinado ou indefinido', true)
ON CONFLICT (nome) DO UPDATE SET 
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo;

-- Comentários para documentação
COMMENT ON COLUMN especies.icone IS 'Ícone emoji para representar a espécie visualmente';
COMMENT ON TABLE sexos IS 'Tabela de sexos dos animais incluindo opção indeterminado';