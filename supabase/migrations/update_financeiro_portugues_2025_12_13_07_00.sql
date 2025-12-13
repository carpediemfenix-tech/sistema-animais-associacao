-- Atualizar formas de pagamento para português de Portugal
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
DROP CONSTRAINT IF EXISTS movimentos_financeiros_2025_12_13_06_00_forma_pagamento_check;

ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
ADD CONSTRAINT movimentos_financeiros_2025_12_13_06_00_forma_pagamento_check 
CHECK (forma_pagamento IN ('dinheiro', 'transferencia_bancaria', 'multibanco', 'mb_way', 'cheque', 'cartao_credito', 'cartao_debito'));

-- Atualizar categorias para português de Portugal
UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Donativos Monetários',
descricao = 'Doações em dinheiro de particulares e empresas'
WHERE codigo = 'R001';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Subsídios Públicos',
descricao = 'Apoios financeiros de entidades públicas e autarquias'
WHERE codigo = 'R002';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Eventos e Campanhas',
descricao = 'Receitas de eventos de angariação de fundos e campanhas'
WHERE codigo = 'R003';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Vendas de Produtos',
descricao = 'Venda de merchandising e produtos da associação'
WHERE codigo = 'R004';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Parcerias Comerciais',
descricao = 'Receitas de parcerias e protocolos com empresas'
WHERE codigo = 'R005';

-- Receitas dos Animais
UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Taxas de Adopção',
descricao = 'Valores pagos pelos adoptantes'
WHERE codigo = 'R101';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Comparticipações Veterinárias',
descricao = 'Valores pagos pelos proprietários para tratamentos'
WHERE codigo = 'R102';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Donativos Específicos',
descricao = 'Doações direcionadas para animais específicos'
WHERE codigo = 'R103';

-- Despesas da Associação
UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Recursos Humanos',
descricao = 'Salários, seguros sociais e benefícios dos colaboradores'
WHERE codigo = 'D001';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Instalações e Equipamentos',
descricao = 'Renda, manutenção e aquisição de equipamentos'
WHERE codigo = 'D002';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Comunicação e Marketing',
descricao = 'Publicidade, website e materiais promocionais'
WHERE codigo = 'D003';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Despesas Administrativas',
descricao = 'Contabilidade, seguros e despesas legais'
WHERE codigo = 'D004';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Transporte e Combustível',
descricao = 'Veículos, combustível e manutenção'
WHERE codigo = 'D005';

-- Despesas dos Animais
UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Cuidados Veterinários',
descricao = 'Consultas, cirurgias e tratamentos médicos'
WHERE codigo = 'D101';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Alimentação',
descricao = 'Ração, suplementos e alimentação especial'
WHERE codigo = 'D102';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Medicamentos',
descricao = 'Medicamentos e produtos farmacêuticos'
WHERE codigo = 'D103';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Alojamento e Cuidados',
descricao = 'Canis, limpeza e materiais de cuidado'
WHERE codigo = 'D104';

UPDATE categorias_financeiras_2025_12_13_06_00 SET 
nome = 'Identificação e Registo',
descricao = 'Chips, coleiras e registos oficiais'
WHERE codigo = 'D105';