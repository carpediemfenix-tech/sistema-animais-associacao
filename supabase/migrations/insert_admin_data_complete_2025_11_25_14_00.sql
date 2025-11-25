-- Inserir dados corretos nas tabelas de administração
-- Data: 2025-11-25 14:00 UTC
-- Baseado nas opções hardcoded dos formulários existentes 🐾

-- 1. INSERIR TIPOS DE GRUPOS (baseado em GestaoGrupos.tsx)
INSERT INTO public.tipos_grupos (nome, descricao, icone) VALUES
('Matilha', 'Grupo de cães - para nossos amigos caninos 🐕', 'Dog'),
('Colónia', 'Colónia de gatos - para nossos amigos felinos 🐱', 'Cat')
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  icone = EXCLUDED.icone,
  updated_at = NOW();

-- 2. INSERIR TIPOS DE EVENTOS (baseado em AnimalDetail.tsx - eventos)
INSERT INTO public.tipos_eventos (nome, descricao, cor) VALUES
('Resgate', 'Operação de resgate do animal - um novo começo! 🚑', '#EF4444'),
('Adoção', 'Processo de adoção - encontrar uma família amorosa! ❤️', '#10B981'),
('Transferência', 'Transferência para outra instituição ou local 🚚', '#8B5CF6'),
('Fuga', 'Animal fugiu do local atual - precisa ser encontrado! 🏃', '#F59E0B'),
('Retorno', 'Animal retornou ao local de origem 🏠', '#06B6D4'),
('Óbito', 'Falecimento do animal - descanse em paz 🌈', '#6B7280'),
('Outro', 'Outros tipos de eventos não listados 📝', '#84CC16')
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  cor = EXCLUDED.cor,
  updated_at = NOW();

-- 3. INSERIR TIPOS DE LOCALIZAÇÕES (baseado em AnimalDetail.tsx - localizações)
INSERT INTO public.tipos_localizacoes (nome, descricao) VALUES
('Canil', 'Canil municipal ou institucional 🏢'),
('CRO', 'Centro de Recolha Oficial 🏛️'),
('FAT', 'Família de Acolhimento Temporário - lar temporário cheio de amor! 🏡'),
('Rua', 'Animal encontrado na rua - precisa de cuidados urgentes! 🛣️'),
('Casa Temporária', 'Casa temporária de voluntários - cuidado especial! 🏠'),
('Outro', 'Outros tipos de localização não listados 📍')
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  updated_at = NOW();

-- 4. VERIFICAR SE OS DADOS FORAM INSERIDOS CORRETAMENTE
SELECT 'DADOS INSERIDOS COM SUCESSO! 🎉' as status;

SELECT 'TIPOS DE GRUPOS:' as categoria;
SELECT id, nome, descricao, icone, ativo FROM public.tipos_grupos ORDER BY nome;

SELECT 'TIPOS DE EVENTOS:' as categoria;
SELECT id, nome, descricao, cor, ativo FROM public.tipos_eventos ORDER BY nome;

SELECT 'TIPOS DE LOCALIZAÇÕES:' as categoria;
SELECT id, nome, descricao, ativo FROM public.tipos_localizacoes ORDER BY nome;

-- 5. VERIFICAR CONTAGEM FINAL DE TODAS AS TABELAS
SELECT 'RESUMO FINAL - SISTEMA PRONTO PARA AJUDAR OS ANIMAIS! 🐾' as status;

SELECT 'especies' as tabela, COUNT(*) as total FROM public.especies
UNION ALL
SELECT 'sexos' as tabela, COUNT(*) as total FROM public.sexos
UNION ALL
SELECT 'especialidades_voluntarios' as tabela, COUNT(*) as total FROM public.especialidades_voluntarios
UNION ALL
SELECT 'tipos_grupos' as tabela, COUNT(*) as total FROM public.tipos_grupos
UNION ALL
SELECT 'tipos_eventos' as tabela, COUNT(*) as total FROM public.tipos_eventos
UNION ALL
SELECT 'tipos_localizacoes' as tabela, COUNT(*) as total FROM public.tipos_localizacoes
ORDER BY tabela;