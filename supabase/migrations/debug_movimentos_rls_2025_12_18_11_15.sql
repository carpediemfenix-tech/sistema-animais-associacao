-- Investigar e corrigir problema de inserção na tabela movimentos_financeiros_2025_12_13_06_00
-- Criada em: 2025-12-18 11:15 UTC

-- 1. Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'movimentos_financeiros_2025_12_13_06_00';

-- 2. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'movimentos_financeiros_2025_12_13_06_00';

-- 3. Desabilitar RLS temporariamente para teste
ALTER TABLE movimentos_financeiros_2025_12_13_06_00 DISABLE ROW LEVEL SECURITY;

-- 4. Remover todas as políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir acesso total movimentos" ON movimentos_financeiros_2025_12_13_06_00;
DROP POLICY IF EXISTS "Permitir inserção movimentos" ON movimentos_financeiros_2025_12_13_06_00;
DROP POLICY IF EXISTS "Permitir leitura movimentos" ON movimentos_financeiros_2025_12_13_06_00;
DROP POLICY IF EXISTS "Permitir atualização movimentos" ON movimentos_financeiros_2025_12_13_06_00;

-- 5. Testar inserção simples para verificar se funciona
INSERT INTO movimentos_financeiros_2025_12_13_06_00 (
    numero_movimento,
    data_movimento,
    tipo,
    escopo,
    valor,
    descricao,
    animal_id
) VALUES (
    'TEST-2025-' || extract(epoch from now())::text,
    CURRENT_DATE,
    'despesa',
    'animal',
    50.00,
    'Teste de inserção via SQL',
    '1685ea69-0598-4850-90c4-536c32323b35'
);

-- 6. Verificar se inserção funcionou
SELECT COUNT(*) as total_movimentos FROM movimentos_financeiros_2025_12_13_06_00;

-- 7. Mostrar último movimento inserido
SELECT * FROM movimentos_financeiros_2025_12_13_06_00 
ORDER BY created_at DESC 
LIMIT 1;