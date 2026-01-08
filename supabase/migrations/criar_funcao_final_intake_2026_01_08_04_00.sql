-- Remover função existente se houver
DROP FUNCTION IF EXISTS public.get_animal_intake_assessment(UUID);

-- Criar função para buscar assessment
CREATE OR REPLACE FUNCTION public.get_animal_intake_assessment(animal_uuid UUID)
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
    injury_count INTEGER
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
        aia.injury_count
    FROM public.animal_intake_assessments aia
    WHERE aia.animal_id = animal_uuid;
END;
$$;

-- Limpar dados existentes para este animal
DELETE FROM public.animal_intake_assessments 
WHERE animal_id = '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid;

-- Inserir dados de teste
INSERT INTO public.animal_intake_assessments (
    animal_id,
    assessor_name,
    intake_origin,
    intake_reason,
    circumstances_details,
    general_condition,
    behavior_entry,
    body_condition,
    weight_kg,
    temperature_celsius,
    symptoms,
    physical_exam_notes,
    behavioral_notes,
    immediate_actions,
    immediate_actions_notes,
    prognosis,
    treatment_plan,
    special_needs,
    is_complete
) VALUES (
    '67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid,
    'Dr. Ana Silva',
    'found_street',
    'abandonment',
    'Animal encontrado numa caixa de cartão junto ao contentor do lixo na Rua das Flores.',
    'poor',
    'fearful',
    'underweight',
    12.3,
    37.8,
    '["vomiting", "diarrhea", "discharge_eyes"]'::jsonb,
    'Animal apresenta sinais de desnutrição moderada. Costelas ligeiramente visíveis.',
    'Muito assustado inicialmente, evita contacto visual. Tremores ocasionais.',
    '["veterinary_exam", "wound_cleaning", "fluid_therapy", "deworming"]'::jsonb,
    'Administrada fluidoterapia subcutânea (150ml). Limpeza e desinfeção da ferida.',
    'good',
    'Tratamento de suporte com fluidoterapia durante 2 dias.',
    'Necessita de ambiente calmo nas primeiras 48h.',
    true
);

-- Testar função
SELECT 
    'Função criada e testada' as status,
    COUNT(*) as registos_encontrados
FROM public.get_animal_intake_assessment('67daf5d6-b573-4c74-81d7-a1065f8786e1'::uuid);