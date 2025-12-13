-- Remover constraint temporariamente
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
DROP CONSTRAINT IF EXISTS movimentos_financeiros_2025_12_13_06_00_forma_pagamento_check;

-- Atualizar dados existentes
UPDATE movimentos_financeiros_2025_12_13_06_00 
SET forma_pagamento = 'mb_way' 
WHERE forma_pagamento = 'mbway';

UPDATE movimentos_financeiros_2025_12_13_06_00 
SET forma_pagamento = 'transferencia_bancaria' 
WHERE forma_pagamento = 'transferencia';

UPDATE movimentos_financeiros_2025_12_13_06_00 
SET forma_pagamento = 'cartao_credito' 
WHERE forma_pagamento = 'cartao';

-- Verificar dados atuais
SELECT DISTINCT forma_pagamento FROM movimentos_financeiros_2025_12_13_06_00;