-- FASE 1: TABELAS PRINCIPAIS PARA FICHA DE ADMISSÃO
-- Data: 2026-01-08 02:00 UTC

-- Tabela principal de avaliações de admissão
CREATE TABLE IF NOT EXISTS public.animal_intake_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessed_by UUID REFERENCES public.voluntarios(id), -- Quem fez a avaliação
  
  -- Circunstâncias da Admissão
  intake_origin VARCHAR(50), -- Referência para intake_config_options
  intake_reason VARCHAR(50), -- Referência para intake_config_options
  circumstances_details TEXT, -- Detalhes das circunstâncias
  
  -- Triagem Imediata
  general_condition VARCHAR(50), -- Referência para intake_config_options
  behavior_entry VARCHAR(50), -- Referência para intake_config_options
  body_condition VARCHAR(50), -- Referência para intake_config_options
  weight_kg DECIMAL(5,2), -- Peso na admissão
  temperature_celsius DECIMAL(4,1), -- Temperatura corporal
  
  -- Avaliação Física (Multi-select usando JSONB)
  symptoms JSONB DEFAULT '[]', -- Array de códigos de sintomas
  
  -- Observações Gerais
  physical_exam_notes TEXT, -- Notas do exame físico
  behavioral_notes TEXT, -- Observações comportamentais
  
  -- Ações Imediatas (Multi-select usando JSONB)
  immediate_actions JSONB DEFAULT '[]', -- Array de códigos de ações
  immediate_actions_notes TEXT, -- Detalhes das ações tomadas
  
  -- Prognóstico e Recomendações
  prognosis VARCHAR(20) CHECK (prognosis IN ('excellent', 'good', 'fair', 'guarded', 'poor')),
  treatment_plan TEXT, -- Plano de tratamento
  special_needs TEXT, -- Necessidades especiais
  
  -- Metadados
  is_complete BOOLEAN DEFAULT false, -- Se a avaliação está completa
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela para ferimentos/lesões específicas (1:N com assessments)
CREATE TABLE IF NOT EXISTS public.animal_intake_injuries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.animal_intake_assessments(id) ON DELETE CASCADE,
  
  -- Detalhes da Lesão
  injury_type VARCHAR(50), -- Referência para intake_config_options
  injury_severity VARCHAR(50), -- Referência para intake_config_options
  body_location VARCHAR(100), -- Localização no corpo
  description TEXT, -- Descrição detalhada
  
  -- Tratamento
  treatment_given TEXT, -- Tratamento aplicado
  requires_followup BOOLEAN DEFAULT false,
  followup_date DATE, -- Data para reavaliação
  
  -- Metadados
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
CREATE OR REPLACE FUNCTION update_intake_assessment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_intake_assessment_updated_at
  BEFORE UPDATE ON public.animal_intake_assessments
  FOR EACH ROW EXECUTE FUNCTION update_intake_assessment_updated_at();

CREATE TRIGGER trigger_intake_injury_updated_at
  BEFORE UPDATE ON public.animal_intake_injuries
  FOR EACH ROW EXECUTE FUNCTION update_intake_assessment_updated_at();

-- Trigger para sincronizar peso com tabela animais
CREATE OR REPLACE FUNCTION sync_animal_weight()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar peso na tabela animais se foi fornecido
  IF NEW.weight_kg IS NOT NULL THEN
    UPDATE public.animais 
    SET peso = NEW.weight_kg,
        updated_at = NOW()
    WHERE id = NEW.animal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_animal_weight
  AFTER INSERT OR UPDATE ON public.animal_intake_assessments
  FOR EACH ROW EXECUTE FUNCTION sync_animal_weight();

-- RLS Policies
ALTER TABLE public.animal_intake_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_intake_injuries ENABLE ROW LEVEL SECURITY;

-- Policies para animal_intake_assessments
CREATE POLICY "intake_assessments_select_policy" ON public.animal_intake_assessments
  FOR SELECT USING (true);

CREATE POLICY "intake_assessments_insert_policy" ON public.animal_intake_assessments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "intake_assessments_update_policy" ON public.animal_intake_assessments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "intake_assessments_delete_policy" ON public.animal_intake_assessments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para animal_intake_injuries
CREATE POLICY "intake_injuries_select_policy" ON public.animal_intake_injuries
  FOR SELECT USING (true);

CREATE POLICY "intake_injuries_insert_policy" ON public.animal_intake_injuries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "intake_injuries_update_policy" ON public.animal_intake_injuries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "intake_injuries_delete_policy" ON public.animal_intake_injuries
  FOR DELETE USING (auth.role() = 'authenticated');

-- Funções helper
CREATE OR REPLACE FUNCTION get_animal_intake_assessment(animal_uuid UUID)
RETURNS TABLE (
  id UUID,
  animal_id UUID,
  assessment_date TIMESTAMP WITH TIME ZONE,
  assessed_by UUID,
  assessor_name VARCHAR(255),
  intake_origin VARCHAR(50),
  intake_reason VARCHAR(50),
  circumstances_details TEXT,
  general_condition VARCHAR(50),
  behavior_entry VARCHAR(50),
  body_condition VARCHAR(50),
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aia.id,
    aia.animal_id,
    aia.assessment_date,
    aia.assessed_by,
    v.nome as assessor_name,
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
    COALESCE(injury_counts.injury_count, 0)::INTEGER as injury_count
  FROM public.animal_intake_assessments aia
  LEFT JOIN public.voluntarios v ON aia.assessed_by = v.id
  LEFT JOIN (
    SELECT assessment_id, COUNT(*) as injury_count
    FROM public.animal_intake_injuries
    GROUP BY assessment_id
  ) injury_counts ON aia.id = injury_counts.assessment_id
  WHERE aia.animal_id = animal_uuid
  ORDER BY aia.assessment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_intake_statistics()
RETURNS TABLE (
  total_assessments BIGINT,
  assessments_this_month BIGINT,
  incomplete_assessments BIGINT,
  critical_conditions BIGINT,
  most_common_origin VARCHAR(50),
  most_common_reason VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE assessment_date >= date_trunc('month', CURRENT_DATE)) as assessments_this_month,
    COUNT(*) FILTER (WHERE is_complete = false) as incomplete_assessments,
    COUNT(*) FILTER (WHERE general_condition = 'critical') as critical_conditions,
    MODE() WITHIN GROUP (ORDER BY intake_origin) as most_common_origin,
    MODE() WITHIN GROUP (ORDER BY intake_reason) as most_common_reason
  FROM public.animal_intake_assessments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar criação
SELECT 'Tabelas de admissão criadas com sucesso' as status;
SELECT COUNT(*) as total_assessments FROM public.animal_intake_assessments;
SELECT COUNT(*) as total_injuries FROM public.animal_intake_injuries;