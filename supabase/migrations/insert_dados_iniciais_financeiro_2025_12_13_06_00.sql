-- DADOS INICIAIS PROFISSIONAIS

-- 1. Categorias Financeiras de Receitas
INSERT INTO categorias_financeiras_2025_12_13_06_00 (codigo, nome, descricao, tipo, escopo, cor, icone, ordem) VALUES
-- Receitas da Associação
('R001', 'Donativos Monetários', 'Doações em dinheiro de particulares e empresas', 'receita', 'associacao', '#10B981', 'Heart', 1),
('R002', 'Subsídios Públicos', 'Apoios financeiros de entidades públicas', 'receita', 'associacao', '#3B82F6', 'Building', 2),
('R003', 'Eventos e Campanhas', 'Receitas de eventos de angariação de fundos', 'receita', 'associacao', '#8B5CF6', 'Calendar', 3),
('R004', 'Vendas de Produtos', 'Venda de merchandising e produtos da associação', 'receita', 'associacao', '#F59E0B', 'ShoppingBag', 4),
('R005', 'Parcerias Comerciais', 'Receitas de parcerias com empresas', 'receita', 'associacao', '#EF4444', 'Handshake', 5),

-- Receitas dos Animais
('R101', 'Taxas de Adoção', 'Valores pagos pelos adotantes', 'receita', 'animal', '#10B981', 'Home', 11),
('R102', 'Comparticipações Veterinárias', 'Valores pagos pelos donos para tratamentos', 'receita', 'animal', '#06B6D4', 'Stethoscope', 12),
('R103', 'Donativos Específicos', 'Doações direcionadas para animais específicos', 'receita', 'animal', '#84CC16', 'Target', 13);

-- 2. Categorias Financeiras de Despesas
INSERT INTO categorias_financeiras_2025_12_13_06_00 (codigo, nome, descricao, tipo, escopo, cor, icone, ordem) VALUES
-- Despesas da Associação
('D001', 'Recursos Humanos', 'Salários, seguros sociais e benefícios', 'despesa', 'associacao', '#DC2626', 'Users', 21),
('D002', 'Instalações e Equipamentos', 'Renda, manutenção e equipamentos', 'despesa', 'associacao', '#7C2D12', 'Building2', 22),
('D003', 'Comunicação e Marketing', 'Publicidade, website e materiais promocionais', 'despesa', 'associacao', '#DB2777', 'Megaphone', 23),
('D004', 'Administrativas', 'Contabilidade, seguros e despesas legais', 'despesa', 'associacao', '#6B7280', 'FileText', 24),
('D005', 'Transporte e Combustível', 'Veículos, combustível e manutenção', 'despesa', 'associacao', '#1F2937', 'Truck', 25),

-- Despesas dos Animais
('D101', 'Cuidados Veterinários', 'Consultas, cirurgias e tratamentos', 'despesa', 'animal', '#DC2626', 'Stethoscope', 31),
('D102', 'Alimentação', 'Ração, suplementos e alimentação especial', 'despesa', 'animal', '#F59E0B', 'Apple', 32),
('D103', 'Medicamentos', 'Medicamentos e produtos farmacêuticos', 'despesa', 'animal', '#EF4444', 'Pill', 33),
('D104', 'Alojamento e Cuidados', 'Canis, limpeza e materiais de cuidado', 'despesa', 'animal', '#8B5CF6', 'Home', 34),
('D105', 'Identificação e Registo', 'Chips, coleiras e registos oficiais', 'despesa', 'animal', '#06B6D4', 'Tag', 35);

-- 3. Contas Financeiras
INSERT INTO contas_financeiras_2025_12_13_06_00 (codigo, nome, tipo, banco, numero_conta, saldo_inicial, saldo_atual) VALUES
('BCO001', 'Conta Corrente Principal', 'banco', 'Caixa Geral de Depósitos', '12345-678901', 5000.00, 5000.00),
('BCO002', 'Conta Poupança', 'poupanca', 'Millennium BCP', 'POUP-789012', 15000.00, 15000.00),
('CX001', 'Caixa Sede', 'caixa', NULL, NULL, 500.00, 500.00),
('CX002', 'Caixa Eventos', 'caixa', NULL, NULL, 200.00, 200.00);

-- 4. Movimentos Financeiros de Exemplo
INSERT INTO movimentos_financeiros_2025_12_13_06_00 (
    data_movimento, tipo, escopo, categoria_id, conta_origem_id, valor, descricao, status, forma_pagamento
) VALUES
-- Receitas da Associação
(CURRENT_DATE - INTERVAL '5 days', 'receita', 'associacao', 
 (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'R001'), 
 (SELECT id FROM contas_financeiras_2025_12_13_06_00 WHERE codigo = 'BCO001'), 
 250.00, 'Donativo de particular - Maria Silva', 'pago', 'transferencia'),

(CURRENT_DATE - INTERVAL '3 days', 'receita', 'associacao', 
 (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'R003'), 
 (SELECT id FROM contas_financeiras_2025_12_13_06_00 WHERE codigo = 'CX002'), 
 450.00, 'Receita do evento de angariação de fundos', 'pago', 'dinheiro'),

-- Despesas da Associação
(CURRENT_DATE - INTERVAL '2 days', 'despesa', 'associacao', 
 (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'D005'), 
 (SELECT id FROM contas_financeiras_2025_12_13_06_00 WHERE codigo = 'BCO001'), 
 85.50, 'Combustível para resgates', 'pago', 'cartao'),

-- Despesas dos Animais (com animal_id se existir)
(CURRENT_DATE - INTERVAL '1 day', 'despesa', 'animal', 
 (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'D101'), 
 (SELECT id FROM contas_financeiras_2025_12_13_06_00 WHERE codigo = 'BCO001'), 
 120.00, 'Consulta veterinária - Vacinação', 'pago', 'multibanco');

-- 5. Orçamentos para o ano atual
INSERT INTO orcamentos_2025_12_13_06_00 (ano, categoria_id, escopo, valor_orcado) VALUES
(EXTRACT(YEAR FROM NOW())::INTEGER, (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'R001'), 'associacao', 12000.00),
(EXTRACT(YEAR FROM NOW())::INTEGER, (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'D101'), 'animal', 8000.00),
(EXTRACT(YEAR FROM NOW())::INTEGER, (SELECT id FROM categorias_financeiras_2025_12_13_06_00 WHERE codigo = 'D102'), 'animal', 6000.00);