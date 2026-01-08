-- DIAGNÓSTICO URGENTE: Verificar se os dados estão sendo salvos

-- 1. Verificar se existe ficha para este animal
SELECT 
    'VERIFICAÇÃO DE EXISTÊNCIA' as teste,
    COUNT(*) as total_fichas,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as resultado
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

-- 2. Mostrar dados atuais (se existirem)
SELECT 
    'DADOS ATUAIS DA FICHA' as secao,
    id,
    animal_id,
    intake_origin,
    intake_reason,
    general_condition,
    behavior_entry,
    body_condition,
    symptoms,
    immediate_actions,
    physical_exam_notes,
    behavioral_notes,
    immediate_actions_notes,
    is_complete,
    created_at,
    updated_at
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'
ORDER BY updated_at DESC
LIMIT 1;

-- 3. Verificar políticas RLS na tabela
SELECT 
    'POLÍTICAS RLS' as secao,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'animal_intake_assessments'
ORDER BY cmd, policyname;

-- 4. Testar inserção manual para verificar se a tabela funciona
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
    'TESTE MANUAL - Resgate de rua',
    'TESTE MANUAL - Estável',
    'TESTE MANUAL - Dócil',
    true,
    'Sistema de Teste',
    NOW(),
    NOW()
) 
ON CONFLICT (animal_id) DO UPDATE SET
    intake_origin = EXCLUDED.intake_origin,
    general_condition = EXCLUDED.general_condition,
    behavior_entry = EXCLUDED.behavior_entry,
    updated_at = NOW()
RETURNING id, animal_id, intake_origin, general_condition, behavior_entry;

-- 5. Verificar novamente após inserção
SELECT 
    'APÓS INSERÇÃO MANUAL' as secao,
    id,
    animal_id,
    intake_origin,
    general_condition,
    behavior_entry,
    updated_at
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';