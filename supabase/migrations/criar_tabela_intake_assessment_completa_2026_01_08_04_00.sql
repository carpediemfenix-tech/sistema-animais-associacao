-- Criar tabela de avaliações de admissão
CREATE TABLE IF NOT EXISTS public.animal_intake_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by UUID,
    assessor_name VARCHAR(200),
    
    -- Circunstâncias da Admissão
    intake_origin VARCHAR(100),
    intake_reason VARCHAR(100),
    circumstances_details TEXT,
    
    -- Triagem Imediata
    general_condition VARCHAR(100),
    behavior_entry VARCHAR(100),
    body_condition VARCHAR(100),
    weight_kg DECIMAL(5,2),
    temperature_celsius DECIMAL(4,1),
    
    -- Avaliação Física
    symptoms JSONB DEFAULT '[]',
    
    -- Observações
    physical_exam_notes TEXT,
    behavioral_notes TEXT,
    
    -- Ações Imediatas
    immediate_actions JSONB DEFAULT '[]',
    immediate_actions_notes TEXT,
    
    -- Prognóstico
    prognosis VARCHAR(20) CHECK (prognosis IN ('excellent', 'good', 'fair', 'guarded', 'poor')),
    treatment_plan TEXT,
    special_needs TEXT,
    
    -- Metadados
    is_complete BOOLEAN DEFAULT false,
    injury_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraint para um assessment por animal
    UNIQUE(animal_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_intake_assessments_animal ON public.animal_intake_assessments(animal_id);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_date ON public.animal_intake_assessments(assessment_date);

-- RLS
ALTER TABLE public.animal_intake_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "intake_assessments_select_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_select_policy" ON public.animal_intake_assessments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "intake_assessments_insert_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_insert_policy" ON public.animal_intake_assessments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_assessments_update_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_update_policy" ON public.animal_intake_assessments
    FOR UPDATE USING (auth.role() = 'authenticated');

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
    'Animal encontrado numa caixa de cartão junto ao contentor do lixo na Rua das Flores. Aparentava estar há várias horas no local, com sinais de desidratação e medo.',
    'poor',
    'fearful',
    'underweight',
    12.3,
    37.8,
    '["vomiting", "diarrhea", "discharge_eyes"]'::jsonb,
    'Animal apresenta sinais de desnutrição moderada. Costelas ligeiramente visíveis, pelagem baça. Presença de parasitas externos (pulgas). Mucosas pálidas indicando possível anemia ligeira. Ferida superficial na pata traseira direita.',
    'Muito assustado inicialmente, evita contacto visual. Tremores ocasionais, possivelmente devido ao stress. Não demonstra agressividade. Responde positivamente a voz calma e movimentos lentos. Mostra interesse por comida.',
    '["veterinary_exam", "wound_cleaning", "fluid_therapy", "deworming"]'::jsonb,
    'Administrada fluidoterapia subcutânea (150ml). Limpeza e desinfeção da ferida na pata. Aplicado antiparasitário tópico. Oferecida alimentação húmida de fácil digestão. Colocado em área calma para observação.',
    'good',
    'Tratamento de suporte com fluidoterapia durante 2 dias. Dieta de recuperação com alimentação 3x/dia. Antibiótico preventivo. Reavaliação em 24h para monitorizar progresso. Socialização gradual.',
    'Necessita de ambiente calmo nas primeiras 48h. Socialização gradual com humanos. Monitorização do apetite e hidratação.',
    true
) ON CONFLICT (animal_id) DO UPDATE SET
    assessor_name = EXCLUDED.assessor_name,
    intake_origin = EXCLUDED.intake_origin,
    intake_reason = EXCLUDED.intake_reason,
    circumstances_details = EXCLUDED.circumstances_details,
    general_condition = EXCLUDED.general_condition,
    behavior_entry = EXCLUDED.behavior_entry,
    body_condition = EXCLUDED.body_condition,
    weight_kg = EXCLUDED.weight_kg,
    temperature_celsius = EXCLUDED.temperature_celsius,
    symptoms = EXCLUDED.symptoms,
    physical_exam_notes = EXCLUDED.physical_exam_notes,
    behavioral_notes = EXCLUDED.behavioral_notes,
    immediate_actions = EXCLUDED.immediate_actions,
    immediate_actions_notes = EXCLUDED.immediate_actions_notes,
    prognosis = EXCLUDED.prognosis,
    treatment_plan = EXCLUDED.treatment_plan,
    special_needs = EXCLUDED.special_needs,
    is_complete = EXCLUDED.is_complete,
    updated_at = NOW();

-- Verificar criação
SELECT 
    'Tabela e função criadas com sucesso' as status,
    COUNT(*) as total_assessments
FROM public.animal_intake_assessments;