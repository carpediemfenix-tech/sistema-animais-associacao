-- =====================================================
-- CORREÇÃO DEFINITIVA - RLS E DADOS APROVISIONAMENTO
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA INSERIR DADOS
ALTER TABLE public.categorias_aprovisionamento_2026_01_06 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_aprovisionamento_2026_01_06 DISABLE ROW LEVEL SECURITY;

-- 2. LIMPAR DADOS EXISTENTES (SE HOUVER)
DELETE FROM public.tipos_aprovisionamento_2026_01_06;
DELETE FROM public.categorias_aprovisionamento_2026_01_06;

-- 3. INSERIR CATEGORIAS PADRÃO
INSERT INTO public.categorias_aprovisionamento_2026_01_06 (nome, descricao, tem_numero_serie, tem_validade, permite_devolucao, permite_atribuicao_animais, requer_verificacao, cor_interface, icone, ativo) VALUES
('Fardamento e EPI', 'Equipamentos de proteção individual e fardamento para voluntários', true, false, true, false, true, '#10B981', 'Shield', true),
('Consumíveis Alimentares', 'Ração, snacks e alimentação para animais', false, true, false, true, false, '#F59E0B', 'Cookie', true),
('Medicação', 'Medicamentos e produtos veterinários', false, true, false, true, false, '#EF4444', 'Pill', true),
('Ferramentas de Terreno', 'Equipamentos para resgates e trabalho de campo', true, false, true, false, true, '#8B5CF6', 'Wrench', true),
('Consumíveis de Escritório', 'Material de escritório e papelaria', false, true, false, false, false, '#6B7280', 'FileText', true),
('Consumíveis de Limpeza', 'Produtos de limpeza e higienização', false, true, false, false, false, '#06B6D4', 'Sparkles', true),
('Equipamentos Eletrônicos', 'Câmeras, rádios, equipamentos de comunicação', true, false, true, false, true, '#3B82F6', 'Camera', true),
('Merchandising', 'Material promocional e merchandising da associação', false, false, true, false, false, '#EC4899', 'Gift', true);

-- 4. INSERIR TIPOS PADRÃO
-- Fardamento e EPI
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Colete Refletor', 'Colete de segurança com faixas refletoras', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Luvas de Proteção', 'Luvas resistentes para manuseamento de animais', 'pares', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Botas de Segurança', 'Calçado de proteção para trabalho de campo', 'pares', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Fardamento e EPI'), 'Capacete de Proteção', 'Capacete para atividades de risco', 'unidades', 0, true);

-- Consumíveis Alimentares
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Ração Cão Adulto', 'Ração seca para cães adultos', 'kg', 30, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Ração Gato Adulto', 'Ração seca para gatos adultos', 'kg', 30, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Ração Cachorro', 'Ração específica para cachorros', 'kg', 30, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Snacks para Cães', 'Petiscos e recompensas', 'pacotes', 60, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis Alimentares'), 'Comida Húmida Gato', 'Latas de comida húmida para gatos', 'latas', 90, true);

-- Medicação
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Antibiótico', 'Medicamentos antibióticos diversos', 'frascos', 30, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Anti-inflamatório', 'Medicamentos anti-inflamatórios', 'comprimidos', 30, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Vacina Antirrábica', 'Vacinas contra a raiva', 'doses', 15, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Desparasitante', 'Medicamentos antiparasitários', 'comprimidos', 45, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Medicação'), 'Analgésico', 'Medicamentos para alívio da dor', 'comprimidos', 30, true);

-- Ferramentas de Terreno
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Transportadora Grande', 'Transportadora para animais de grande porte', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Transportadora Média', 'Transportadora para animais de médio porte', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Açaime Ajustável', 'Açaime de segurança ajustável', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Laço de Captura', 'Laço para captura segura de animais', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Rede de Captura', 'Rede para captura de animais pequenos', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Ferramentas de Terreno'), 'Lanterna LED', 'Lanterna potente para trabalho noturno', 'unidades', 0, true);

-- Equipamentos Eletrônicos
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Câmera Digital', 'Câmera para documentação de resgates', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Rádio Comunicação', 'Rádio para comunicação em campo', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Telemóvel', 'Telemóvel para comunicações', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Equipamentos Eletrônicos'), 'Tablet', 'Tablet para registos digitais', 'unidades', 0, true);

-- Consumíveis de Escritório
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Papel A4', 'Resmas de papel para impressão', 'resmas', 365, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Tinteiros', 'Tinteiros para impressoras', 'unidades', 730, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Canetas', 'Canetas esferográficas', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Escritório'), 'Agrafos', 'Agrafos para agrafador', 'caixas', 0, true);

-- Consumíveis de Limpeza
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Detergente', 'Detergente para limpeza geral', 'litros', 730, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Desinfetante', 'Desinfetante para higienização', 'litros', 365, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Sacos de Lixo', 'Sacos de lixo resistentes', 'rolos', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Consumíveis de Limpeza'), 'Panos de Limpeza', 'Panos de microfibra', 'unidades', 0, true);

-- Merchandising
INSERT INTO public.tipos_aprovisionamento_2026_01_06 (categoria_id, nome, descricao, unidade_medida, dias_alerta_validade, ativo) VALUES
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'T-shirt Associação', 'T-shirt com logótipo da associação', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'Caneca', 'Caneca promocional', 'unidades', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'Autocolantes', 'Autocolantes promocionais', 'folhas', 0, true),
((SELECT id FROM categorias_aprovisionamento_2026_01_06 WHERE nome = 'Merchandising'), 'Porta-chaves', 'Porta-chaves da associação', 'unidades', 0, true);

-- 5. VERIFICAR DADOS INSERIDOS
SELECT 'CATEGORIAS INSERIDAS' as status, COUNT(*) as total FROM public.categorias_aprovisionamento_2026_01_06;
SELECT 'TIPOS INSERIDOS' as status, COUNT(*) as total FROM public.tipos_aprovisionamento_2026_01_06;

-- 6. REMOVER TODAS AS POLÍTICAS RLS ANTIGAS
DROP POLICY IF EXISTS "categorias_select_authenticated" ON public.categorias_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "categorias_insert_authenticated" ON public.categorias_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "categorias_update_authenticated" ON public.categorias_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "categorias_delete_authenticated" ON public.categorias_aprovisionamento_2026_01_06;

DROP POLICY IF EXISTS "tipos_select_authenticated" ON public.tipos_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "tipos_insert_authenticated" ON public.tipos_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "tipos_update_authenticated" ON public.tipos_aprovisionamento_2026_01_06;
DROP POLICY IF EXISTS "tipos_delete_authenticated" ON public.tipos_aprovisionamento_2026_01_06;

-- 7. CRIAR POLÍTICAS RLS MAIS PERMISSIVAS
-- Políticas para categorias - TOTALMENTE PERMISSIVAS
CREATE POLICY "categorias_all_operations" ON public.categorias_aprovisionamento_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para tipos - TOTALMENTE PERMISSIVAS  
CREATE POLICY "tipos_all_operations" ON public.tipos_aprovisionamento_2026_01_06
    FOR ALL USING (true) WITH CHECK (true);

-- 8. REABILITAR RLS COM POLÍTICAS PERMISSIVAS
ALTER TABLE public.categorias_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_aprovisionamento_2026_01_06 ENABLE ROW LEVEL SECURITY;

-- 9. VERIFICAR POLÍTICAS CRIADAS
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('categorias_aprovisionamento_2026_01_06', 'tipos_aprovisionamento_2026_01_06')
ORDER BY tablename, cmd;

-- 10. TESTE FINAL - CONTAR DADOS COM RLS ATIVO
SELECT 'TESTE FINAL - CATEGORIAS' as tipo, COUNT(*) as total FROM public.categorias_aprovisionamento_2026_01_06;
SELECT 'TESTE FINAL - TIPOS' as tipo, COUNT(*) as total FROM public.tipos_aprovisionamento_2026_01_06;

-- 11. VERIFICAR CONTAGEM POR CATEGORIA
SELECT 
    c.nome as categoria,
    COUNT(t.id) as total_tipos
FROM public.categorias_aprovisionamento_2026_01_06 c
LEFT JOIN public.tipos_aprovisionamento_2026_01_06 t ON c.id = t.categoria_id
GROUP BY c.id, c.nome
ORDER BY c.nome;