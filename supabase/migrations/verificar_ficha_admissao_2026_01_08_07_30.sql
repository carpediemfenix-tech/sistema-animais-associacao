-- Verificar dados da ficha de admissão para o animal específico
SELECT 
    'FICHA DE ADMISSÃO - DADOS ATUAIS' as secao,
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
ORDER BY updated_at DESC;

-- Verificar se a tabela existe e tem dados
SELECT 
    'ESTATÍSTICAS DA TABELA' as secao,
    COUNT(*) as total_fichas,
    COUNT(DISTINCT animal_id) as animais_com_ficha,
    MAX(updated_at) as ultima_atualizacao
FROM animal_intake_assessments;

-- Verificar estrutura da tabela
SELECT 
    'ESTRUTURA DA TABELA' as secao,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a função RPC existe
SELECT 
    'FUNÇÃO RPC' as secao,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_animal_intake_assessment'
AND routine_schema = 'public';