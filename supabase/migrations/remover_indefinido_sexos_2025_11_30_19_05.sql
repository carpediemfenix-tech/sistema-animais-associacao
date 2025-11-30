-- Remover opção "Indefinido" duplicada da tabela sexos
DELETE FROM sexos WHERE nome = 'Indefinido';

-- Verificar sexos restantes
SELECT id, nome, descricao, ativo FROM sexos WHERE ativo = true ORDER BY nome;

-- Garantir que temos as opções corretas
INSERT INTO sexos (nome, descricao, ativo) 
VALUES 
  ('Macho', 'Sexo masculino', true),
  ('Fêmea', 'Sexo feminino', true),
  ('Indeterminado', 'Sexo não determinado ou indefinido', true)
ON CONFLICT (nome) DO UPDATE SET 
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo;

-- Verificar resultado final
SELECT id, nome, descricao, ativo FROM sexos WHERE ativo = true ORDER BY nome;