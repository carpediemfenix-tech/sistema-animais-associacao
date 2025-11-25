-- Inserir dados de teste nas tabelas de opções se estiverem vazias
-- Data: 2025-11-25 10:00 UTC

-- Inserir espécies se a tabela estiver vazia
INSERT INTO public.especies_opcoes (nome, descricao, ativo)
SELECT * FROM (VALUES
  ('Cão', 'Canis lupus familiaris', true),
  ('Gato', 'Felis catus', true),
  ('Coelho', 'Oryctolagus cuniculus', true),
  ('Hamster', 'Cricetinae', true),
  ('Pássaro', 'Aves diversas', true),
  ('Tartaruga', 'Testudines', true),
  ('Outro', 'Outras espécies', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.especies_opcoes);

-- Inserir sexos se a tabela estiver vazia
INSERT INTO public.sexos_opcoes (nome, descricao, ativo)
SELECT * FROM (VALUES
  ('Macho', 'Sexo masculino', true),
  ('Fêmea', 'Sexo feminino', true),
  ('Indefinido', 'Sexo não determinado', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.sexos_opcoes);

-- Inserir especialidades se a tabela estiver vazia
INSERT INTO public.especialidades_opcoes (nome, descricao, categoria, ativo)
SELECT * FROM (VALUES
  ('Clínica Geral', 'Consultas gerais e check-ups', 'Médica', true),
  ('Cirurgia', 'Procedimentos cirúrgicos', 'Cirúrgica', true),
  ('Dermatologia', 'Problemas de pele e pelo', 'Médica', true),
  ('Cardiologia', 'Problemas cardíacos', 'Médica', true),
  ('Oftalmologia', 'Problemas oculares', 'Médica', true),
  ('Ortopedia', 'Problemas ósseos e articulares', 'Cirúrgica', true),
  ('Medicina Preventiva', 'Vacinação e prevenção', 'Preventiva', true)
) AS v(nome, descricao, categoria, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.especialidades_opcoes);

-- Inserir estados se a tabela estiver vazia
INSERT INTO public.estados_opcoes (nome, descricao, cor, ativo)
SELECT * FROM (VALUES
  ('Ativo', 'Animal ativo na associação', '#10B981', true),
  ('Adotado', 'Animal foi adotado', '#3B82F6', true),
  ('Óbito', 'Animal faleceu', '#EF4444', true),
  ('Transferido', 'Animal transferido para outra instituição', '#F59E0B', true),
  ('Crítico', 'Animal em estado crítico', '#DC2626', true),
  ('Recuperação', 'Animal em recuperação', '#8B5CF6', true),
  ('Quarentena', 'Animal em quarentena', '#F97316', true)
) AS v(nome, descricao, cor, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.estados_opcoes);

-- Inserir tipos de intervenções se a tabela estiver vazia
INSERT INTO public.tipos_intervencoes_opcoes (nome, descricao, categoria, ativo)
SELECT * FROM (VALUES
  ('Consulta Geral', 'Consulta médica geral', 'Médica', true),
  ('Vacinação', 'Administração de vacinas', 'Preventiva', true),
  ('Castração', 'Procedimento de castração', 'Cirúrgica', true),
  ('Desparasitação', 'Tratamento contra parasitas', 'Preventiva', true),
  ('Cirurgia', 'Procedimento cirúrgico geral', 'Cirúrgica', true),
  ('Exame de Sangue', 'Análises sanguíneas', 'Diagnóstica', true),
  ('Raio-X', 'Exame radiológico', 'Diagnóstica', true),
  ('Tratamento Feridas', 'Cuidado de ferimentos', 'Médica', true),
  ('Consulta Urgência', 'Atendimento de urgência', 'Urgente', true)
) AS v(nome, descricao, categoria, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_intervencoes_opcoes);

-- Verificar dados inseridos
SELECT 'especies_opcoes' as tabela, COUNT(*) as total FROM public.especies_opcoes;
SELECT 'sexos_opcoes' as tabela, COUNT(*) as total FROM public.sexos_opcoes;
SELECT 'especialidades_opcoes' as tabela, COUNT(*) as total FROM public.especialidades_opcoes;
SELECT 'estados_opcoes' as tabela, COUNT(*) as total FROM public.estados_opcoes;
SELECT 'tipos_intervencoes_opcoes' as tabela, COUNT(*) as total FROM public.tipos_intervencoes_opcoes;