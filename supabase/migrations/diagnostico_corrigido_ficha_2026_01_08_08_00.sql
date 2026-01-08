-- DIAGNÓSTICO CORRIGIDO: Verificar estrutura e dados

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    'ESTRUTURA DA TABELA' as secao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints e índices
SELECT 
    'CONSTRAINTS E ÍNDICES' as secao,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'animal_intake_assessments'::regclass;

-- 3. Verificar se existe ficha para este animal
SELECT 
    'VERIFICAÇÃO DE EXISTÊNCIA' as teste,
    COUNT(*) as total_fichas,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as resultado
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1';

-- 4. Mostrar dados atuais (se existirem)
SELECT 
    'DADOS ATUAIS DA FICHA' as secao,
    id,
    animal_id,
    intake_origin,
    intake_reason,
    general_condition,
    behavior_entry,
    body_condition,
    created_at,
    updated_at
FROM animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'
ORDER BY updated_at DESC;

-- 5. Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as secao,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'animal_intake_assessments';

-- 6. Testar inserção simples (sem ON CONFLICT)
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
    'TESTE MANUAL - Resgate de rua',
    'TESTE MANUAL - Estável', 
    'TESTE MANUAL - Dócil',
    true,
    'Sistema de Teste',
    NOW(),
    NOW()
) RETURNING id, animal_id, intake_origin, general_condition;