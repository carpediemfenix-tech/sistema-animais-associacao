-- Remover funções existentes e recriar
DROP FUNCTION IF EXISTS public.get_animal_intake_assessment(uuid);
DROP FUNCTION IF EXISTS public.get_intake_statistics();

-- Função helper para buscar avaliação de admissão de um animal
CREATE OR REPLACE FUNCTION public.get_animal_intake_assessment(
    animal_uuid UUID
)
RETURNS TABLE (
    id UUID,
    animal_id UUID,
    assessment_date TIMESTAMP WITH TIME ZONE,
    assessed_by UUID,
    assessor_name VARCHAR(200),
    intake_origin VARCHAR(100),
    intake_reason VARCHAR(100),
    circumstances_details TEXT,
    general_condition VARCHAR(100),
    behavior_entry VARCHAR(100),
    body_condition VARCHAR(100),
    weight_kg DECIMAL(5,2),
    temperature_celsius DECIMAL(4,1),
    symptoms JSONB,
    physical_exam_notes TEXT,
    behavioral_notes TEXT,
    immediate_actions JSONB,
    immediate_actions_notes TEXT,
    prognosis VARCHAR(20),
    treatment_plan TEXT,
    special_needs TEXT,
    is_complete BOOLEAN,
    injury_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aia.id,
        aia.animal_id,
        aia.assessment_date,
        aia.assessed_by,
        aia.assessor_name,
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
        aia.injury_count,
        aia.created_at,
        aia.updated_at
    FROM public.animal_intake_assessments aia
    WHERE aia.animal_id = animal_uuid
    ORDER BY aia.assessment_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de admissão
CREATE OR REPLACE FUNCTION public.get_intake_statistics()
RETURNS TABLE (
    total_assessments BIGINT,
    assessments_this_month BIGINT,
    incomplete_assessments BIGINT,
    critical_conditions BIGINT,
    most_common_origin TEXT,
    most_common_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.animal_intake_assessments) as total_assessments,
        (SELECT COUNT(*) FROM public.animal_intake_assessments 
         WHERE assessment_date >= date_trunc('month', CURRENT_DATE)) as assessments_this_month,
        (SELECT COUNT(*) FROM public.animal_intake_assessments 
         WHERE is_complete = false) as incomplete_assessments,
        (SELECT COUNT(*) FROM public.animal_intake_assessments 
         WHERE general_condition = 'critical') as critical_conditions,
        (SELECT intake_origin FROM public.animal_intake_assessments 
         WHERE intake_origin IS NOT NULL 
         GROUP BY intake_origin 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_origin,
        (SELECT intake_reason FROM public.animal_intake_assessments 
         WHERE intake_reason IS not NULL 
         GROUP BY intake_reason 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar funções
SELECT 'Funções de admissão corrigidas com sucesso' as status;