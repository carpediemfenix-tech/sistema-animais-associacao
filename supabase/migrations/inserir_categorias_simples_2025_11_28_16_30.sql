-- Verificar quantas categorias existem
SELECT COUNT(*) as total_categorias FROM categorias_financeiras;

-- Limpar tabela se necessário (apenas para debug)
-- DELETE FROM categorias_financeiras;

-- Inserir categorias padrão
INSERT INTO categorias_financeiras (nome, descricao, tipo, escopo, cor, icone, ativo, ordem) VALUES
-- Receitas da Associação
('Donativos', 'Doações recebidas de particulares e empresas', 'receita', 'associacao', '#10B981', 'Heart', true, 1),
('Subsídios', 'Apoios governamentais e de fundações', 'receita', 'associacao', '#3B82F6', 'Building', true, 2),
('Eventos Beneficentes', 'Receitas de eventos de angariação de fundos', 'receita', 'associacao', '#8B5CF6', 'Calendar', true, 3),
('Vendas', 'Vendas de produtos e merchandising', 'receita', 'associacao', '#F59E0B', 'ShoppingBag', true, 4),
('Parcerias', 'Receitas de parcerias e patrocínios', 'receita', 'associacao', '#06B6D4', 'Handshake', true, 5),

-- Receitas de Animais
('Taxas de Adoção', 'Taxas pagas pelos adotantes', 'receita', 'animal', '#10B981', 'Heart', true, 6),
('Donativos para Animal', 'Doações específicas para um animal', 'receita', 'animal', '#EC4899', 'Heart', true, 7),

-- Despesas da Associação
('Salários', 'Pagamentos a funcionários e voluntários', 'despesa', 'associacao', '#EF4444', 'Users', true, 8),
('Utilities', 'Água, luz, gás, internet, telefone', 'despesa', 'associacao', '#F97316', 'Zap', true, 9),
('Manutenção Instalações', 'Reparações e manutenção das instalações', 'despesa', 'associacao', '#84CC16', 'Wrench', true, 10),
('Material de Escritório', 'Papelaria, impressões, material administrativo', 'despesa', 'associacao', '#6366F1', 'FileText', true, 11),
('Transporte', 'Combustível, manutenção de veículos, transportes', 'despesa', 'associacao', '#8B5CF6', 'Car', true, 12),
('Marketing', 'Publicidade, materiais promocionais, website', 'despesa', 'associacao', '#EC4899', 'Megaphone', true, 13),

-- Despesas de Animais
('Veterinário', 'Consultas, tratamentos e cirurgias veterinárias', 'despesa', 'animal', '#EF4444', 'Stethoscope', true, 14),
('Medicamentos', 'Medicamentos e suplementos para animais', 'despesa', 'animal', '#F97316', 'Pill', true, 15),
('Alimentação', 'Ração, comida húmida e snacks para animais', 'despesa', 'animal', '#84CC16', 'Apple', true, 16),
('Material Animal', 'Camas, brinquedos, coleiras, trelas, transportadoras', 'despesa', 'animal', '#06B6D4', 'Package', true, 17),

-- Categorias Ambas
('Seguros', 'Seguros diversos (instalações, responsabilidade civil, etc.)', 'despesa', 'ambos', '#6B7280', 'Shield', true, 18);

-- Verificar resultado
SELECT COUNT(*) as total_categorias_apos_insercao FROM categorias_financeiras;
SELECT nome, tipo, escopo, ativo FROM categorias_financeiras ORDER BY ordem LIMIT 10;