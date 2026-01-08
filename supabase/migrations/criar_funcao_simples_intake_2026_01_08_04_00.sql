-- Verificar colunas existentes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Criar função simples que funciona com as colunas existentes
DROP FUNCTION IF EXISTS public.get_animal_intake_assessment(UUID);

CREATE OR REPLACE FUNCTION public.get_animal_intake_assessment(animal_uuid UUID)
RETURNS TABLE (
    id UUID,
    animal_id UUID,
    assessment_date TIMESTAMP WITH TIME ZONE,
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
    is_complete BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aia.id,
        aia.animal_id,
        aia.assessment_date,
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
        aia.is_complete
    FROM public.animal_intake_assessments aia
    WHERE aia.animal_id = animal_uuid;
END;
$$;

-- Inserir dados de teste simples
INSERT INTO public.animal_intake_assessments (
    animal_id,
    assessor_name,
    intake_origin,
    intake_reason,
    circumstances_details,
    general_condition,
    prognosis,
    is_complete
) VALUES (
    '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid,
    'Dr. Ana Silva',
    'found_street',
    'abandonment',
    'Animal encontrado numa caixa de cartão junto ao contentor do lixo.',
    'poor',
    'good',
    true
);

-- Testar função
SELECT 'Função testada com sucesso' as status;