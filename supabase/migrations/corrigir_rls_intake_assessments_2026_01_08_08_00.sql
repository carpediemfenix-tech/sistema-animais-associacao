-- Verificar políticas RLS atuais
SELECT 
    'POLÍTICAS ATUAIS' as secao,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'animal_intake_assessments'
ORDER BY cmd, policyname;

-- Remover políticas restritivas antigas
DROP POLICY IF EXISTS "animal_intake_assessments_select_policy" ON animal_intake_assessments;
DROP POLICY IF EXISTS "animal_intake_assessments_insert_policy" ON animal_intake_assessments;
DROP POLICY IF EXISTS "animal_intake_assessments_update_policy" ON animal_intake_assessments;
DROP POLICY IF EXISTS "animal_intake_assessments_delete_policy" ON animal_intake_assessments;

-- Criar políticas permissivas para todas as operações
CREATE POLICY "animal_intake_assessments_select_all" ON animal_intake_assessments
    FOR SELECT USING (true);

CREATE POLICY "animal_intake_assessments_insert_all" ON animal_intake_assessments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "animal_intake_assessments_update_all" ON animal_intake_assessments
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "animal_intake_assessments_delete_all" ON animal_intake_assessments
    FOR DELETE USING (true);

-- Verificar se RLS está ativo
SELECT 
    'STATUS RLS' as secao,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'animal_intake_assessments';

-- Verificar políticas após criação
SELECT 
    'POLÍTICAS APÓS CORREÇÃO' as secao,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'animal_intake_assessments'
ORDER BY cmd, policyname;

-- Testar inserção após correção de políticas
DELETE FROM animal_intake_assessments WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

INSERT INTO animal_intake_assessments (
    animal_id,
    intake_origin,
    general_condition,
    behavior_entry,
    is_complete,
    assessor_name,
    created_at,
    updated_at
) VALUES (
    '67daf5d6-b573-4c74-81d7-a1065f8786e1',
    'TESTE APÓS CORREÇÃO RLS - Resgate de rua',
    'TESTE APÓS CORREÇÃO RLS - Estável',
    'TESTE APÓS CORREÇÃO RLS - Dócil',
    true,
    'Sistema Corrigido',
    NOW(),
    NOW()
) RETURNING id, animal_id, intake_origin, general_condition;