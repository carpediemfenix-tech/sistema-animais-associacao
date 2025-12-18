-- Corrigir foreign key constraint para tabela intervencoes (intervenções médicas)
-- Criada em: 2025-12-18 12:20 UTC

-- 1. Verificar constraints existentes para tabela intervencoes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'intervencoes';

-- 2. Remover constraint existente entre movimentos e intervencoes
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
DROP CONSTRAINT IF EXISTS movimentos_financeiros_2025_12_13_06_00_intervencao_id_fkey;

-- 3. Recriar constraint com CASCADE DELETE para tabela intervencoes
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 
ADD CONSTRAINT movimentos_financeiros_2025_12_13_06_00_intervencao_id_fkey 
FOREIGN KEY (intervencao_id) REFERENCES intervencoes(id) ON DELETE CASCADE;

-- 4. Verificar se funcionou
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    rc.delete_rule,
    ccu.table_name AS references_table
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'movimentos_financeiros_2025_12_13_06_00'
  AND ccu.table_name = 'intervencoes';

-- 5. Contar movimentos relacionados com intervenções
SELECT 
    COUNT(*) as movimentos_com_intervencao
FROM movimentos_financeiros_2025_12_13_06_00 
WHERE intervencao_id IS NOT NULL;