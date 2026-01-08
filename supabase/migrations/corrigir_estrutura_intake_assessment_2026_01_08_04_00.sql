-- Verificar estrutura atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar colunas em falta se não existirem
DO $$
BEGIN
    -- Adicionar assessor_name se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animal_intake_assessments' 
        AND column_name = 'assessor_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.animal_intake_assessments 
        ADD COLUMN assessor_name VARCHAR(200);
    END IF;
    
    -- Adicionar outras colunas essenciais se não existirem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'animal_intake_assessments' 
        AND column_name = 'intake_origin'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.animal_intake_assessments 
        ADD COLUMN intake_origin VARCHAR(100),
        ADD COLUMN intake_reason VARCHAR(100),
        ADD COLUMN circumstances_details TEXT,
        ADD COLUMN general_condition VARCHAR(100),
        ADD COLUMN behavior_entry VARCHAR(100),
        ADD COLUMN body_condition VARCHAR(100),
        ADD COLUMN weight_kg DECIMAL(5,2),
        ADD COLUMN temperature_celsius DECIMAL(4,1),
        ADD COLUMN symptoms JSONB DEFAULT '[]',
        ADD COLUMN physical_exam_notes TEXT,
        ADD COLUMN behavioral_notes TEXT,
        ADD COLUMN immediate_actions JSONB DEFAULT '[]',
        ADD COLUMN immediate_actions_notes TEXT,
        ADD COLUMN prognosis VARCHAR(20),
        ADD COLUMN treatment_plan TEXT,
        ADD COLUMN special_needs TEXT,
        ADD COLUMN is_complete BOOLEAN DEFAULT false,
        ADD COLUMN injury_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar estrutura após alterações
SELECT 
    'Estrutura corrigida' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'animal_intake_assessments' 
  AND table_schema = 'public';