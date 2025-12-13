-- Primeiro atualizar dados existentes
UPDATE movimentos_financeiros_2025_12_13_06_00 
SET forma_pagamento = 'mb_way' 
WHERE forma_pagamento = 'mbway';

UPDATE movimentos_financeiros_2025_12_13_06_00 
SET forma_pagamento = 'transferencia_bancaria' 
WHERE forma_pagamento = 'transferencia';

UPDATE movimentos_financeiros_2025_12_13_06_00 
SET forma_pagamento = 'cartao_credito' 
WHERE forma_pagamento = 'cartao';

-- Agora alterar a constraint
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
DROP CONSTRAINT IF EXISTS movimentos_financeiros_2025_12_13_06_00_forma_pagamento_check;

ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
ADD CONSTRAINT movimentos_financeiros_2025_12_13_06_00_forma_pagamento_check 
CHECK (forma_pagamento IN ('dinheiro', 'transferencia_bancaria', 'multibanco', 'mb_way', 'cheque', 'cartao_credito', 'cartao_debito'));