-- ===== FASE 1: TABELAS PRINCIPAIS PARA FICHA DE ADMISSÃO =====
-- Data: 2026-01-08 02:00 UTC
-- Descrição: Criar tabelas para armazenar avaliações de admissão e lesões

-- Tabela principal de avaliação de admissão
CREATE TABLE IF NOT EXISTS public.animal_intake_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL, -- Referência ao animal (sem FK por enquanto)
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by UUID, -- Referência ao voluntário que fez a avaliação (sem FK por enquanto)
    assessor_name VARCHAR(200), -- Nome do avaliador (backup)
    
    -- Circunstâncias da Admissão
    intake_origin VARCHAR(100), -- Código da origem (referência a intake_config_options)
    intake_reason VARCHAR(100), -- Código da razão (referência a intake_config_options)
    circumstances_details TEXT, -- Detalhes das circunstâncias
    
    -- Triagem Imediata
    general_condition VARCHAR(100), -- Código do estado geral
    behavior_entry VARCHAR(100), -- Código do comportamento
    body_condition VARCHAR(100), -- Código da condição corporal
    weight_kg DECIMAL(5,2), -- Peso em kg
    temperature_celsius DECIMAL(4,1), -- Temperatura em Celsius
    
    -- Avaliação Física (arrays JSONB para multi-select)
    symptoms JSONB DEFAULT '[]', -- Array de códigos de sintomas
    
    -- Observações
    physical_exam_notes TEXT, -- Notas do exame físico
    behavioral_notes TEXT, -- Observações comportamentais
    
    -- Ações Imediatas (arrays JSONB para multi-select)
    immediate_actions JSONB DEFAULT '[]', -- Array de códigos de ações
    immediate_actions_notes TEXT, -- Detalhes das ações realizadas
    
    -- Prognóstico
    prognosis VARCHAR(20) CHECK (prognosis IN ('excellent', 'good', 'fair', 'guarded', 'poor')),
    treatment_plan TEXT, -- Plano de tratamento
    special_needs TEXT, -- Necessidades especiais
    
    -- Metadados
    is_complete BOOLEAN DEFAULT false, -- Se a avaliação está completa
    injury_count INTEGER DEFAULT 0, -- Número de lesões registadas
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de lesões (relacionamento 1:N com avaliações)
CREATE TABLE IF NOT EXISTS public.animal_intake_injuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.animal_intake_assessments(id) ON DELETE CASCADE,
    injury_type VARCHAR(100) NOT NULL, -- Código do tipo de lesão
    injury_severity VARCHAR(100) NOT NULL, -- Código da severidade
    body_location VARCHAR(200) NOT NULL, -- Localização no corpo
    description TEXT, -- Descrição detalhada
    treatment_given TEXT, -- Tratamento aplicado
    requires_followup BOOLEAN DEFAULT false, -- Requer acompanhamento
    followup_date DATE, -- Data de acompanhamento
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_intake_assessments_animal ON public.animal_intake_assessments(animal_id);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_date ON public.animal_intake_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_intake_assessments_assessor ON public.animal_intake_assessments(assessed_by);
CREATE INDEX IF NOT EXISTS idx_intake_injuries_assessment ON public.animal_intake_injuries(assessment_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_intake_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_intake_assessments_updated_at ON public.animal_intake_assessments;
CREATE TRIGGER trigger_update_intake_assessments_updated_at
    BEFORE UPDATE ON public.animal_intake_assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_intake_assessments_updated_at();

DROP TRIGGER IF EXISTS trigger_update_intake_injuries_updated_at ON public.animal_intake_injuries;
CREATE TRIGGER trigger_update_intake_injuries_updated_at
    BEFORE UPDATE ON public.animal_intake_injuries
    FOR EACH ROW EXECUTE FUNCTION public.update_intake_assessments_updated_at();

-- Trigger para sincronizar peso com tabela de animais (se existir)
CREATE OR REPLACE FUNCTION public.sync_animal_weight_from_intake()
RETURNS TRIGGER AS $$
BEGIN
    -- Tentar atualizar o peso na tabela de animais se existir
    BEGIN
        UPDATE public.animais_2025_12_18_14_15 
        SET peso = NEW.weight_kg, updated_at = NOW()
        WHERE id = NEW.animal_id::text
        AND (peso IS NULL OR peso != NEW.weight_kg);
    EXCEPTION WHEN OTHERS THEN
        -- Ignorar erro se tabela não existir
        NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_animal_weight ON public.animal_intake_assessments;
CREATE TRIGGER trigger_sync_animal_weight
    AFTER INSERT OR UPDATE OF weight_kg ON public.animal_intake_assessments
    FOR EACH ROW 
    WHEN (NEW.weight_kg IS NOT NULL)
    EXECUTE FUNCTION public.sync_animal_weight_from_intake();

-- RLS (Row Level Security)
ALTER TABLE public.animal_intake_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_intake_injuries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para animal_intake_assessments
DROP POLICY IF EXISTS "intake_assessments_select_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_select_policy" ON public.animal_intake_assessments
    FOR SELECT USING (true); -- Todos podem ler

DROP POLICY IF EXISTS "intake_assessments_insert_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_insert_policy" ON public.animal_intake_assessments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_assessments_update_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_update_policy" ON public.animal_intake_assessments
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_assessments_delete_policy" ON public.animal_intake_assessments;
CREATE POLICY "intake_assessments_delete_policy" ON public.animal_intake_assessments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para animal_intake_injuries
DROP POLICY IF EXISTS "intake_injuries_select_policy" ON public.animal_intake_injuries;
CREATE POLICY "intake_injuries_select_policy" ON public.animal_intake_injuries
    FOR SELECT USING (true); -- Todos podem ler

DROP POLICY IF EXISTS "intake_injuries_insert_policy" ON public.animal_intake_injuries;
CREATE POLICY "intake_injuries_insert_policy" ON public.animal_intake_injuries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_injuries_update_policy" ON public.animal_intake_injuries;
CREATE POLICY "intake_injuries_update_policy" ON public.animal_intake_injuries
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "intake_injuries_delete_policy" ON public.animal_intake_injuries;
CREATE POLICY "intake_injuries_delete_policy" ON public.animal_intake_injuries
    FOR DELETE USING (auth.role() = 'authenticated');

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
         WHERE intake_reason IS NOT NULL 
         GROUP BY intake_reason 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar criação
SELECT 'Tabelas de admissão criadas com sucesso' as status;
SELECT 
    (SELECT COUNT(*) FROM public.animal_intake_assessments) as total_avaliacoes,
    (SELECT COUNT(*) FROM public.animal_intake_injuries) as total_lesoes;