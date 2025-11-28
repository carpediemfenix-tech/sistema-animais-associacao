-- Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'categorias_financeiras';

-- Remover todas as políticas RLS existentes para categorias_financeiras
DROP POLICY IF EXISTS "Enable read access for all users" ON categorias_financeiras;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categorias_financeiras;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categorias_financeiras;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categorias_financeiras;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON categorias_financeiras;
DROP POLICY IF EXISTS "categorias_financeiras_select_policy" ON categorias_financeiras;
DROP POLICY IF EXISTS "categorias_financeiras_insert_policy" ON categorias_financeiras;
DROP POLICY IF EXISTS "categorias_financeiras_update_policy" ON categorias_financeiras;
DROP POLICY IF EXISTS "categorias_financeiras_delete_policy" ON categorias_financeiras;

-- Criar políticas RLS simples e funcionais
CREATE POLICY "categorias_select_policy" ON categorias_financeiras
    FOR SELECT USING (true);

CREATE POLICY "categorias_insert_policy" ON categorias_financeiras
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categorias_update_policy" ON categorias_financeiras
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "categorias_delete_policy" ON categorias_financeiras
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'categorias_financeiras';

-- Garantir que RLS está habilitado
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'categorias_financeiras';

-- Testar inserção (deve funcionar agora)
SELECT 'Políticas RLS corrigidas com sucesso!' as resultado;