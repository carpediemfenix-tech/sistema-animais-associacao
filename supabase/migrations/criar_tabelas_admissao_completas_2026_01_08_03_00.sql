-- ===== CRIAR TABELAS DE ADMISSÃO COMPLETAS =====
-- Data: 2026-01-08 03:00 UTC

-- Tabela principal de avaliação de admissão
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
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de lesões
CREATE TABLE IF NOT EXISTS public.animal_intake_injuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.animal_intake_assessments(id) ON DELETE CASCADE,
    injury_type VARCHAR(100) NOT NULL,
    injury_severity VARCHAR(100) NOT NULL,
    body_location VARCHAR(200) NOT NULL,
    description TEXT,
    treatment_given TEXT,
    requires_followup BOOLEAN DEFAULT false,
    followup_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_intake_assessments_animal ON public.animal_intake_assessments(animal_id);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_date ON public.animal_intake_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_intake_injuries_assessment ON public.animal_intake_injuries(assessment_id);

-- RLS
ALTER TABLE public.animal_intake_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_intake_injuries ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "intake_injuries_select_policy" ON public.animal_intake_injuries;
CREATE POLICY "intake_injuries_select_policy" ON public.animal_intake_injuries
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "intake_injuries_insert_policy" ON public.animal_intake_injuries;
CREATE POLICY "intake_injuries_insert_policy" ON public.animal_intake_injuries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verificar criação
SELECT 'Tabelas de admissão criadas com sucesso' as status;