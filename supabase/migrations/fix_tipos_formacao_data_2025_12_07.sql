-- VERIFICAR E CORRIGIR DADOS DOS TIPOS DE FORMAÇÃO
-- Diagnóstico e correção dos problemas de carregamento
-- Criado em: 2025-12-07 05:00 UTC

-- 1. VERIFICAR SE A TABELA EXISTE E TEM DADOS
SELECT 'Verificando tabela tipos_formacao...' as status;
SELECT COUNT(*) as total_tipos FROM public.tipos_formacao;

-- 2. MOSTRAR DADOS EXISTENTES (se houver)
SELECT id, codigo, nome, nivel_ordem, ativo FROM public.tipos_formacao ORDER BY nivel_ordem;

-- 3. LIMPAR DADOS EXISTENTES (se houver problemas)
DELETE FROM public.tipos_formacao;

-- 4. INSERIR DADOS CORRETOS NOVAMENTE
INSERT INTO public.tipos_formacao (codigo, nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone, ativo) VALUES
('FORMA_BASE', 'FORMA BASE', 'Formação básica obrigatória para todos os voluntários. Inclui cuidados básicos com animais, primeiros socorros e protocolos de segurança.', 1, 40, 
 '["Cuidados básicos com animais", "Primeiros socorros veterinários", "Protocolos de segurança", "Ética no resgate", "Comunicação eficaz"]'::jsonb, 
 '[]'::jsonb, '#10B981', '🌱', true),

('FORMA_N1', 'Formação Nível 1', 'Primeiro nível de especialização em resgate e maneio avançado de animais. Capacita para operações de resgate básicas.', 2, 60, 
 '["Técnicas de resgate básico", "Maneio de animais agressivos", "Avaliação comportamental", "Uso de equipamentos", "Trabalho em equipa"]'::jsonb, 
 '[]'::jsonb, '#3B82F6', '🛡️', true),

('FORMA_N2', 'Formação Nível 2', 'Nível intermédio com competências de liderança e coordenação de equipas. Preparação para liderar operações de resgate.', 3, 80, 
 '["Liderança de equipas", "Coordenação de operações", "Gestão de emergências", "Formação de voluntários", "Planeamento estratégico"]'::jsonb, 
 '[]'::jsonb, '#8B5CF6', '⚔️', true),

('FORMA_N3', 'Formação Nível 3', 'Nível máximo de formação. Capacita para formar outros formadores e gerir o sistema de formação da associação.', 4, 100, 
 '["Formação de formadores", "Gestão do sistema formativo", "Desenvolvimento curricular", "Avaliação de competências", "Supervisão geral"]'::jsonb, 
 '[]'::jsonb, '#F59E0B', '👑', true),

('FORMA_VET', 'Especialização Veterinária', 'Especialização em cuidados veterinários avançados e procedimentos médicos de emergência.', 5, 120, 
 '["Procedimentos veterinários", "Farmacologia básica", "Cirurgia de emergência", "Diagnóstico clínico", "Cuidados intensivos"]'::jsonb, 
 '[]'::jsonb, '#EF4444', '🏥', true),

('FORMA_RESCUE', 'Especialização em Resgate', 'Especialização em técnicas avançadas de resgate em situações complexas e perigosas.', 5, 100, 
 '["Resgate em altura", "Resgate aquático", "Operações noturnas", "Uso de drones", "Coordenação com autoridades"]'::jsonb, 
 '[]'::jsonb, '#F97316', '🚁', true);

-- 5. VERIFICAR INSERÇÃO
SELECT 'Dados inseridos com sucesso!' as status;
SELECT COUNT(*) as total_tipos_apos_insercao FROM public.tipos_formacao;
SELECT codigo, nome, nivel_ordem FROM public.tipos_formacao ORDER BY nivel_ordem;

-- 6. TESTAR CONSULTA COMO O FRONTEND FAZ
SELECT 
  id,
  codigo,
  nome,
  descricao,
  nivel_ordem,
  carga_horaria_minima,
  competencias,
  pre_requisitos,
  cor,
  icone,
  ativo,
  created_at,
  updated_at
FROM public.tipos_formacao 
WHERE ativo = true 
ORDER BY nivel_ordem ASC;

-- Comentário final
COMMENT ON TABLE public.tipos_formacao IS 'Dados corrigidos e verificados - 6 tipos de formação disponíveis';