-- Verificar políticas RLS atuais na tabela animais
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'animais'
ORDER BY cmd, policyname;

-- Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'animais';

-- Criar política permissiva para UPDATE se não existir
DO $$
BEGIN
    -- Remover políticas restritivas antigas se existirem
    DROP POLICY IF EXISTS "animais_update_policy" ON animais;
    DROP POLICY IF EXISTS "animais_select_policy" ON animais;
    DROP POLICY IF EXISTS "animais_insert_policy" ON animais;
    
    -- Criar políticas permissivas para todas as operações
    CREATE POLICY "animais_select_all" ON animais
        FOR SELECT USING (true);
    
    CREATE POLICY "animais_insert_all" ON animais
        FOR INSERT WITH CHECK (true);
    
    CREATE POLICY "animais_update_all" ON animais
        FOR UPDATE USING (true) WITH CHECK (true);
    
    CREATE POLICY "animais_delete_all" ON animais
        FOR DELETE USING (true);
        
    RAISE NOTICE 'Políticas RLS atualizadas com sucesso para tabela animais';
END
$$;

-- Verificar políticas após criação
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'animais'
ORDER BY cmd, policyname;