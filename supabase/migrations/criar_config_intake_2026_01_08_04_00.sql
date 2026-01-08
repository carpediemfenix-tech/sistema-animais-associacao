-- Criar tabela de configurações da ficha de admissão
CREATE TABLE IF NOT EXISTS public.intake_config_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES public.intake_config_options(id),
    metadata JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_intake_config_domain ON public.intake_config_options(domain);
CREATE INDEX IF NOT EXISTS idx_intake_config_active ON public.intake_config_options(is_active);

-- RLS
ALTER TABLE public.intake_config_options ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "intake_config_select_policy" ON public.intake_config_options;
CREATE POLICY "intake_config_select_policy" ON public.intake_config_options
    FOR SELECT USING (true);

-- Inserir dados padrão
INSERT INTO public.intake_config_options (domain, code, name, sort_order) VALUES
-- Origem da admissão
('intake_origin', 'found_street', 'Encontrado na rua', 1),
('intake_origin', 'owner_surrender', 'Entregue pelo dono', 2),
('intake_origin', 'stray_capture', 'Captura de vadio', 3),
('intake_origin', 'transfer', 'Transferência', 4),
('intake_origin', 'born_shelter', 'Nascido no abrigo', 5),

-- Razão da admissão
('intake_reason', 'abandonment', 'Abandono', 1),
('intake_reason', 'lost', 'Perdido', 2),
('intake_reason', 'financial_hardship', 'Dificuldades financeiras', 3),
('intake_reason', 'behavioral_issues', 'Problemas comportamentais', 4),
('intake_reason', 'medical_issues', 'Problemas médicos', 5),
('intake_reason', 'housing_restrictions', 'Restrições habitacionais', 6),

-- Estado geral
('general_condition', 'excellent', 'Excelente', 1),
('general_condition', 'good', 'Bom', 2),
('general_condition', 'fair', 'Razoável', 3),
('general_condition', 'poor', 'Mau', 4),
('general_condition', 'critical', 'Crítico', 5),

-- Comportamento na entrada
('behavior_entry', 'calm_friendly', 'Calmo e amigável', 1),
('behavior_entry', 'nervous', 'Nervoso', 2),
('behavior_entry', 'fearful', 'Medroso', 3),
('behavior_entry', 'aggressive', 'Agressivo', 4),
('behavior_entry', 'withdrawn', 'Retraído', 5),

-- Condição corporal
('body_condition', 'obese', 'Obeso', 1),
('body_condition', 'overweight', 'Acima do peso', 2),
('body_condition', 'ideal', 'Peso ideal', 3),
('body_condition', 'underweight', 'Abaixo do peso', 4),
('body_condition', 'emaciated', 'Emaciado', 5),

-- Sintomas
('symptoms', 'vomiting', 'Vómitos', 1),
('symptoms', 'diarrhea', 'Diarreia', 2),
('symptoms', 'discharge_eyes', 'Secreção ocular', 3),
('symptoms', 'discharge_nasal', 'Secreção nasal', 4),
('symptoms', 'coughing', 'Tosse', 5),
('symptoms', 'limping', 'Coxear', 6),
('symptoms', 'lethargy', 'Letargia', 7),

-- Ações imediatas
('immediate_actions', 'veterinary_exam', 'Exame veterinário', 1),
('immediate_actions', 'wound_cleaning', 'Limpeza de feridas', 2),
('immediate_actions', 'fluid_therapy', 'Fluidoterapia', 3),
('immediate_actions', 'deworming', 'Desparasitação', 4),
('immediate_actions', 'vaccination', 'Vacinação', 5),
('immediate_actions', 'isolation', 'Isolamento', 6)
ON CONFLICT (domain, code) DO NOTHING;

-- Criar função para buscar opções
CREATE OR REPLACE FUNCTION public.get_intake_config_options(domain_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    domain VARCHAR(100),
    code VARCHAR(100),
    name VARCHAR(200),
    is_active BOOLEAN,
    parent_id UUID,
    metadata JSONB,
    sort_order INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF domain_filter IS NULL THEN
        RETURN QUERY
        SELECT ico.id, ico.domain, ico.code, ico.name, ico.is_active, 
               ico.parent_id, ico.metadata, ico.sort_order
        FROM public.intake_config_options ico
        WHERE ico.is_active = true
        ORDER BY ico.domain, ico.sort_order, ico.name;
    ELSE
        RETURN QUERY
        SELECT ico.id, ico.domain, ico.code, ico.name, ico.is_active, 
               ico.parent_id, ico.metadata, ico.sort_order
        FROM public.intake_config_options ico
        WHERE ico.domain = domain_filter AND ico.is_active = true
        ORDER BY ico.sort_order, ico.name;
    END IF;
END;
$$;

-- Verificar dados inseridos
SELECT 
    'Configurações criadas' as status,
    COUNT(*) as total_opcoes,
    COUNT(DISTINCT domain) as total_dominios
FROM public.intake_config_options;