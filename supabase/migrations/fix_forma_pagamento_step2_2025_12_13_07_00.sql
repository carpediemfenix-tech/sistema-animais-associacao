-- Recriar constraint com valores corretos
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
ADD CONSTRAINT movimentos_financeiros_2025_12_13_06_00_forma_pagamento_check 
CHECK (forma_pagamento IN ('dinheiro', 'transferencia_bancaria', 'multibanco', 'mb_way', 'cheque', 'cartao_credito', 'cartao_debito'));

-- Atualizar categorias para português de Portugal
UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Taxas de Adopção',
descricao = 'Valores pagos pelos adoptantes'
WHERE codigo = 'R101';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Comparticipações Veterinárias',
descricao = 'Valores pagos pelos proprietários para tratamentos'
WHERE codigo = 'R102';

-- Adicionar nova categoria para clínicas
INSERT INTO categorias_financeiras_2025_12_13_06_00 (codigo, nome, descricao, tipo, escopo, cor, icone, ordem) VALUES
('D106', 'Despesas com Clínicas', 'Pagamentos a clínicas veterinárias por serviços prestados', 'despesa', 'animal', '#DC2626', 'Building2', 36)
ON CONFLICT (codigo) DO NOTHING;

-- Adicionar categoria para receitas de clínicas
INSERT INTO categorias_financeiras_2025_12_13_06_00 (codigo, nome, descricao, tipo, escopo, cor, icone, ordem) VALUES
('R104', 'Receitas de Clínicas', 'Valores recebidos de clínicas por protocolos e parcerias', 'receita', 'animal', '#10B981', 'Building2', 14)
ON CONFLICT (codigo) DO NOTHING;