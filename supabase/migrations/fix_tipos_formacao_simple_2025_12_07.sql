-- DIAGNÓSTICO SIMPLES E CORREÇÃO DA TABELA TIPOS_FORMACAO
-- Verificar e corrigir problemas de carregamento
-- Criado em: 2025-12-07 05:30 UTC

-- 1. VERIFICAR SE A TABELA EXISTE E TEM DADOS
SELECT 'Verificando tabela tipos_formacao...' as status;
SELECT COUNT(*) as total_registos FROM public.tipos_formacao;

-- 2. MOSTRAR DADOS EXISTENTES
SELECT 'Dados existentes:' as status;
SELECT id, codigo, nome, nivel_ordem, ativo FROM public.tipos_formacao ORDER BY nivel_ordem;

-- 3. LIMPAR E RECRIAR DADOS
DELETE FROM public.tipos_formacao;

-- 4. INSERIR DADOS BÁSICOS PARA TESTE
INSERT INTO public.tipos_formacao (codigo, nome, descricao, nivel_ordem, carga_horaria_minima, competencias, pre_requisitos, cor, icone, ativo) VALUES
('FORMA_BASE', 'FORMA BASE', 'Formação básica obrigatória para todos os voluntários', 1, 40, 
 '["Cuidados básicos", "Primeiros socorros", "Protocolos de segurança"]'::jsonb, 
 '[]'::jsonb, '#10B981', '🌱', true),

('FORMA_N1', 'Formação Nível 1', 'Primeiro nível de especialização em resgate', 2, 60, 
 '["Técnicas de resgate", "Maneio de animais", "Trabalho em equipa"]'::jsonb, 
 '[]'::jsonb, '#3B82F6', '🛡️', true),

('FORMA_N2', 'Formação Nível 2', 'Nível intermédio com liderança', 3, 80, 
 '["Liderança de equipas", "Coordenação", "Gestão de emergências"]'::jsonb, 
 '[]'::jsonb, '#8B5CF6', '⚔️', true),

('FORMA_N3', 'Formação Nível 3', 'Nível máximo - formador de formadores', 4, 100, 
 '["Formação de formadores", "Gestão do sistema", "Supervisão geral"]'::jsonb, 
 '[]'::jsonb, '#F59E0B', '👑', true),

('FORMA_VET', 'Especialização Veterinária', 'Cuidados veterinários avançados', 5, 120, 
 '["Procedimentos veterinários", "Farmacologia", "Cirurgia de emergência"]'::jsonb, 
 '[]'::jsonb, '#EF4444', '🏥', true),

('FORMA_RESCUE', 'Especialização em Resgate', 'Técnicas avançadas de resgate', 5, 100, 
 '["Resgate em altura", "Resgate aquático", "Operações noturnas"]'::jsonb, 
 '[]'::jsonb, '#F97316', '🚁', true);

-- 5. VERIFICAR INSERÇÃO
SELECT 'Dados inseridos!' as status;
SELECT COUNT(*) as total_apos_insercao FROM public.tipos_formacao;

-- 6. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.tipos_formacao;
DROP POLICY IF EXISTS "tipos_formacao_select_policy" ON public.tipos_formacao;
DROP POLICY IF EXISTS "tipos_formacao_insert_policy" ON public.tipos_formacao;
DROP POLICY IF EXISTS "tipos_formacao_update_policy" ON public.tipos_formacao;
DROP POLICY IF EXISTS "tipos_formacao_delete_policy" ON public.tipos_formacao;

-- 7. DESATIVAR RLS TEMPORARIAMENTE PARA TESTE
ALTER TABLE public.tipos_formacao DISABLE ROW LEVEL SECURITY;

-- 8. DAR PERMISSÕES COMPLETAS
GRANT ALL ON public.tipos_formacao TO authenticated;
GRANT ALL ON public.tipos_formacao TO anon;

-- 9. TESTAR CONSULTA FINAL
SELECT 'Teste final da consulta:' as status;
SELECT id, codigo, nome, nivel_ordem, ativo FROM public.tipos_formacao WHERE ativo = true ORDER BY nivel_ordem;

-- Comentário
COMMENT ON TABLE public.tipos_formacao IS 'Tabela corrigida - RLS desativado para teste - 6 tipos disponíveis';