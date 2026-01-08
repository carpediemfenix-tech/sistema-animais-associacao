-- Verificar se a tabela existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'animal_intake_assessments'
ORDER BY ordinal_position;

-- Se não existir, criar a tabela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'animal_intake_assessments'
    ) THEN
        -- Criar tabela se não existir
        CREATE TABLE public.animal_intake_assessments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            animal_id UUID NOT NULL,
            assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
            symptoms JSONB DEFAULT '[]',
            physical_exam_notes TEXT,
            behavioral_notes TEXT,
            immediate_actions JSONB DEFAULT '[]',
            immediate_actions_notes TEXT,
            prognosis VARCHAR(20) CHECK (prognosis IN ('excellent', 'good', 'fair', 'guarded', 'poor')),
            treatment_plan TEXT,
            special_needs TEXT,
            is_complete BOOLEAN DEFAULT false,
            injury_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES auth.users(id)
        );
        
        -- Adicionar RLS
        ALTER TABLE public.animal_intake_assessments ENABLE ROW LEVEL SECURITY;
        
        -- Política de leitura
        CREATE POLICY "intake_assessments_select_policy" ON public.animal_intake_assessments
            FOR SELECT USING (true);
            
        RAISE NOTICE 'Tabela animal_intake_assessments criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela animal_intake_assessments já existe';
    END IF;
END $$;

-- Verificar novamente
SELECT COUNT(*) as total_colunas 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'animal_intake_assessments';