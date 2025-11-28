-- 🔍 EKO: VERIFICAR E CORRIGIR CATEGORIAS FINANCEIRAS
-- Data: 2025-11-28 06:00 UTC

-- Verificar se existem categorias
SELECT COUNT(*) as total_categorias FROM public.categorias_financeiras_2025_11_28_05_52;

-- Se não existirem, recriar as categorias padrão
INSERT INTO public.categorias_financeiras_2025_11_28_05_52 (nome, descricao, tipo, escopo, cor, icone, codigo, ordem) VALUES
-- RECEITAS ANIMAIS
('Donativos para Animal', 'Donativos direcionados para um animal específico', 'receita', 'animal', '#10B981', 'Heart', 'DON_ANIMAL', 1),
('Taxa de Adoção', 'Taxa paga na adoção de um animal', 'receita', 'animal', '#059669', 'Home', 'TAXA_ADOCAO', 2),
('Patrocínio Animal', 'Patrocínio mensal/anual de um animal', 'receita', 'animal', '#047857', 'Star', 'PATROCINIO', 3),

-- DESPESAS ANIMAIS
('Veterinário', 'Consultas, cirurgias e tratamentos veterinários', 'despesa', 'animal', '#EF4444', 'Stethoscope', 'VET', 10),
('Medicação', 'Medicamentos, vacinas e suplementos', 'despesa', 'animal', '#DC2626', 'Pill', 'MED', 11),
('Alimentação Animal', 'Ração e alimentação específica do animal', 'despesa', 'animal', '#B91C1C', 'Cookie', 'ALIM_ANIMAL', 12),
('Transporte Animal', 'Transporte para consultas, adoções, etc.', 'despesa', 'animal', '#991B1B', 'Car', 'TRANSP_ANIMAL', 13),
('Higiene Animal', 'Banhos, tosquia, produtos de higiene', 'despesa', 'animal', '#7F1D1D', 'Scissors', 'HIG_ANIMAL', 14),
('Equipamento Animal', 'Coleiras, trelas, camas, brinquedos', 'despesa', 'animal', '#450A0A', 'Package', 'EQUIP_ANIMAL', 15),

-- RECEITAS ASSOCIAÇÃO
('Donativos Gerais', 'Donativos para a associação em geral', 'receita', 'associacao', '#3B82F6', 'DollarSign', 'DON_GERAL', 20),
('Subsídios', 'Subsídios governamentais ou de fundações', 'receita', 'associacao', '#2563EB', 'Building', 'SUBSIDIOS', 21),
('Eventos Fundraising', 'Receitas de eventos de angariação de fundos', 'receita', 'associacao', '#1D4ED8', 'Calendar', 'EVENTOS', 22),
('Vendas', 'Vendas de produtos da associação', 'receita', 'associacao', '#1E40AF', 'ShoppingBag', 'VENDAS', 23),
('Parcerias', 'Receitas de parcerias comerciais', 'receita', 'associacao', '#1E3A8A', 'Handshake', 'PARCERIAS', 24),

-- DESPESAS ASSOCIAÇÃO
('Infraestrutura', 'Renda, utilities, manutenção das instalações', 'despesa', 'associacao', '#F59E0B', 'Building2', 'INFRA', 30),
('Recursos Humanos', 'Salários, seguros, formação de funcionários', 'despesa', 'associacao', '#D97706', 'Users', 'RH', 31),
('Alimentação Geral', 'Ração e alimentação para o canil/gatil', 'despesa', 'associacao', '#B45309', 'Utensils', 'ALIM_GERAL', 32),
('Marketing', 'Publicidade, website, redes sociais', 'despesa', 'associacao', '#92400E', 'Megaphone', 'MARKETING', 33),
('Equipamento Geral', 'Equipamentos para as instalações', 'despesa', 'associacao', '#78350F', 'Wrench', 'EQUIP_GERAL', 34),
('Transporte Geral', 'Combustível, manutenção de viaturas', 'despesa', 'associacao', '#451A03', 'Truck', 'TRANSP_GERAL', 35),
('Administrativo', 'Contabilidade, seguros, licenças', 'despesa', 'associacao', '#374151', 'FileText', 'ADMIN', 36),
('Emergências', 'Despesas imprevistas e emergências', 'despesa', 'associacao', '#1F2937', 'AlertTriangle', 'EMERGENCIA', 37)
ON CONFLICT (codigo) DO NOTHING;

-- Verificar novamente
SELECT COUNT(*) as total_categorias_final FROM public.categorias_financeiras_2025_11_28_05_52;

-- Mostrar algumas categorias para confirmar
SELECT id, nome, tipo, escopo, ativo FROM public.categorias_financeiras_2025_11_28_05_52 
WHERE ativo = true 
ORDER BY ordem 
LIMIT 10;