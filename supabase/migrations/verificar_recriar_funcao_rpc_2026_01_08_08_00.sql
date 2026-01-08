-- Verificar se a função RPC existe
SELECT 
    'FUNÇÃO RPC EXISTENTE' as secao,
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_animal_intake_assessment'
AND routine_schema = 'public';

-- Recriar a função RPC se necessário
DROP FUNCTION IF EXISTS public.get_animal_intake_assessment(UUID);

CREATE OR REPLACE FUNCTION public.get_animal_intake_assessment(animal_uuid UUID)
RETURNS TABLE (
    id UUID,
    animal_id UUID,
    intake_origin TEXT,
    intake_reason TEXT,
    circumstances_details TEXT,
    general_condition TEXT,
    behavior_entry TEXT,
    body_condition TEXT,
    weight_kg NUMERIC,
    temperature_celsius NUMERIC,
    symptoms JSONB,
    physical_exam_notes TEXT,
    behavioral_notes TEXT,
    immediate_actions JSONB,
    immediate_actions_notes TEXT,
    prognosis TEXT,
    treatment_plan TEXT,
    special_needs TEXT,
    is_complete BOOLEAN,
    assessor_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aia.id,
        aia.animal_id,
        aia.intake_origin,
        aia.intake_reason,
        aia.circumstances_details,
        aia.general_condition,
        aia.behavior_entry,
        aia.body_condition,
        aia.weight_kg,
        aia.temperature_celsius,
        aia.symptoms,
        aia.physical_exam_notes,
        aia.behavioral_notes,
        aia.immediate_actions,
        aia.immediate_actions_notes,
        aia.prognosis,
        aia.treatment_plan,
        aia.special_needs,
        aia.is_complete,
        aia.assessor_name,
        aia.created_at,
        aia.updated_at
    FROM animal_intake_assessments aia
    WHERE aia.animal_id = animal_uuid
    ORDER BY aia.updated_at DESC;
END;
$$;

-- Testar a função
SELECT 'TESTE DA FUNÇÃO RPC' as secao;
SELECT * FROM public.get_animal_intake_assessment('67daf5d6-b573-4c74-81d7-a1065f8786e1'::UUID);